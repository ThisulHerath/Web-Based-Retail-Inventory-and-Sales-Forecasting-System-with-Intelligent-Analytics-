import api from './api';

// Get all users
export const getAllUsers = async (page = 1, limit = 10, role = '') => {
    const params = { page, limit };
    if (role) params.role = role;
    const response = await api.get('/users', { params });
    return response.data;
};

// Get user statistics
export const getUserStats = async () => {
    const response = await api.get('/users/stats/summary');
    return response.data;
};

// Create user
export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};
