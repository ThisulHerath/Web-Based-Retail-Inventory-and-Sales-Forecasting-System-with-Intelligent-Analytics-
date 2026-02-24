import api from './api';

// Get all customers (admin panel)
export const getAllCustomers = async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/customers', { params: { page, limit, search } });
    return response.data;
};

// Get customer by ID
export const getCustomerById = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

// Update customer
export const updateCustomer = async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
};

// Delete customer
export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};

// Get customer stats
export const getCustomerStats = async () => {
    const response = await api.get('/customers/stats/summary');
    return response.data;
};
