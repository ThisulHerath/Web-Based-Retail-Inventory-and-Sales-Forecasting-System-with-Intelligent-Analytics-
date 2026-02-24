import api from './api';

// Stock in
export const stockIn = async (stockData) => {
    const response = await api.post('/stock/in', stockData);
    return response.data;
};

// Stock out
export const stockOut = async (stockData) => {
    const response = await api.post('/stock/out', stockData);
    return response.data;
};

// Get stock history for a product
export const getStockHistory = async (productId, page = 1, limit = 20) => {
    const response = await api.get(`/stock/history/${productId}`, {
        params: { page, limit },
    });
    return response.data;
};

// Get all stock transactions
export const getAllTransactions = async (page = 1, limit = 20, type = '') => {
    const params = { page, limit };
    if (type) params.type = type;
    const response = await api.get('/stock/transactions', { params });
    return response.data;
};
