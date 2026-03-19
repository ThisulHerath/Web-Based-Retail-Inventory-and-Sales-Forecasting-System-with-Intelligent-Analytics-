import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Handle FormData - let axios set the correct content-type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // 401: Unauthorized (Token invalid/expired) -> Only redirect if on admin pages
            if (status === 401) {
                const isAdminPage = window.location.pathname.startsWith('/admin');
                if (isAdminPage) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cart');
                    window.location.href = '/admin/login';
                }
            }

            // 403: Forbidden -> Only logout if account is disabled and on admin pages
            if (status === 403 && data?.message === 'Account is disabled. Please contact admin.') {
                const isAdminPage = window.location.pathname.startsWith('/admin');
                if (isAdminPage) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cart');
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
