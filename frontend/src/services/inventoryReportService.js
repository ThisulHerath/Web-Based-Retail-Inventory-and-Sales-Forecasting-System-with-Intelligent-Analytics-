import api from './api';

export const getInventoryReports = async (page = 1, limit = 10) => {
    const response = await api.get('/inventory/reports', { params: { page, limit } });
    return response.data;
};

export const getInventoryReportById = async (id) => {
    const response = await api.get(`/inventory/reports/${id}`);
    return response.data;
};

export const createInventoryReport = async (payload) => {
    const response = await api.post('/inventory/reports', payload);
    return response.data;
};

export const updateInventoryReport = async (id, payload) => {
    const response = await api.put(`/inventory/reports/${id}`, payload);
    return response.data;
};

export const deleteInventoryReport = async (id) => {
    const response = await api.delete(`/inventory/reports/${id}`);
    return response.data;
};
