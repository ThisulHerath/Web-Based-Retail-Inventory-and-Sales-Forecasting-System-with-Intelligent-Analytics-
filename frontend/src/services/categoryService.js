import api from './api';

export const getAllCategories = async (page = 1, limit = 50, search = '') => {
    const params = { page, limit, search };
    const response = await api.get('/categories', { params });
    return response.data;
};

export const getCategoryById = async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

export const createCategory = async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};
