import api from './api';

// Get all products
export const getAllProducts = async (page = 1, limit = 10, search = '', lowStock = false) => {
    const params = { page, limit, search };
    if (lowStock) params.lowStock = 'true';
    const response = await api.get('/products', { params });
    return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// Get low stock products
export const getLowStockProducts = async () => {
    const response = await api.get('/products/low-stock/list');
    return response.data;
};

// Create product
export const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};
