import api from './api';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/feedback';

const getCustomerToken = () => {
    const raw = localStorage.getItem('customerInfo');
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return parsed?.token || null;
    } catch (error) {
        return null;
    }
};

export const getPublicFeedbacks = async (limit = 6) => {
    const { data } = await axios.get(`${BASE_URL}/public`, { params: { limit } });
    return data;
};

export const getMyFeedbacks = async () => {
    const token = getCustomerToken();
    const { data } = await axios.get(`${BASE_URL}/my`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
};

export const submitFeedback = async ({ rating, comment }) => {
    const token = getCustomerToken();
    const { data } = await axios.post(
        BASE_URL,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
};

export const getCustomerFeedbacks = async (customerId) => {
    const { data } = await api.get(`/feedback/customer/${customerId}`);
    return data;
};

export const updateFeedbackStatus = async (feedbackId, status) => {
    const { data } = await api.patch(`/feedback/${feedbackId}/status`, { status });
    return data;
};

export const deleteFeedbackById = async (feedbackId) => {
    const { data } = await api.delete(`/feedback/${feedbackId}`);
    return data;
};
