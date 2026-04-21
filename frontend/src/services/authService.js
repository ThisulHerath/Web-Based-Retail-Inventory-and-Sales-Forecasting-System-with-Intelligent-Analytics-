import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
    });
    return response.data;
};
