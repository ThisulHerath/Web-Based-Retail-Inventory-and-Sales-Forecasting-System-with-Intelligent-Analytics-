import api from './api';
import axios from 'axios';

// Validate coupon (admin/cashier)
export const validateCoupon = async (code) => {
    const response = await api.post('/coupons/validate', { code });
    return response.data;
};

// Generate coupon (admin/manager)
export const generateCoupon = async (couponData) => {
    const response = await api.post('/coupons/generate', couponData);
    return response.data;
};

// Get coupons for a customer (admin view)
export const getCustomerCoupons = async (customerId) => {
    const response = await api.get(`/coupons/customer/${customerId}`);
    return response.data;
};

// Get my coupons (customer portal)
export const getMyCoupons = async (token) => {
    const response = await axios.get('http://localhost:5000/api/coupons/my-coupons', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
