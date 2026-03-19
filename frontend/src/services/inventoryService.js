import api from './api';

export const getAllInventory = async (page = 1, limit = 20, search = '', category = '', lowStock = false) => {
    const params = { page, limit, search };
    if (category) params.category = category;
    if (lowStock) params.lowStock = 'true';
    const response = await api.get('/inventory', { params });
    return response.data;
};

export const getInventoryByProduct = async (productId) => {
    const response = await api.get(`/inventory/${productId}`);
    return response.data;
};

export const getInventoryStats = async () => {
    const response = await api.get('/inventory/stats/summary');
    return response.data;
};
