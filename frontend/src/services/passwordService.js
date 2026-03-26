import api from './api';

export const checkPasswordBreach = async (password) => {
    const response = await api.post('/security/password-check', { password });
    return response.data;
};
