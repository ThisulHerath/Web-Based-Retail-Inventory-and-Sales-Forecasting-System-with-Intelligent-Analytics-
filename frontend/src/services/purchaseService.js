import api from './api';

export const getAllPurchases = async (page = 1, limit = 10, supplier = '', startDate = '', endDate = '') => {
    const params = { page, limit };
    if (supplier) params.supplier = supplier;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/purchases', { params });
    return response.data;
};

export const getPurchaseById = async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
};

export const createPurchase = async (data) => {
    const response = await api.post('/purchases', data);
    return response.data;
};

export const deletePurchase = async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
};

export const getPurchaseStats = async () => {
    const response = await api.get('/purchases/stats/summary');
    return response.data;
};
