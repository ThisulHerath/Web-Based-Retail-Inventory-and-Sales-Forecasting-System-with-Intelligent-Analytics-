import api from './api';

export const getAllWalkInCustomers = async (page = 1, limit = 100, search = '') => {
    const { data } = await api.get('/walk-in-customers', {
        params: { page, limit, search },
    });
    return data;
};

export const createWalkInCustomer = async (payload) => {
    const { data } = await api.post('/walk-in-customers', payload);
    return data;
};

export const updateWalkInCustomer = async (id, payload) => {
    const { data } = await api.put(`/walk-in-customers/${id}`, payload);
    return data;
};

export const getWalkInCustomerByPhone = async (phone) => {
    const { data } = await api.get(`/walk-in-customers/phone/${encodeURIComponent(phone)}`);
    return data;
};
