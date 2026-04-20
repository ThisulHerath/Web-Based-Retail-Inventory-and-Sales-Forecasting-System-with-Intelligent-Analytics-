import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import useIdleLogout from '../hooks/useIdleLogout';

const IDLE_LOGOUT_TIMEOUT_MS = 4 * 60 * 1000;

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedCustomer = localStorage.getItem('customerInfo');
        if (storedCustomer) {
            setCustomer(JSON.parse(storedCustomer));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/customers/login', {
                email,
                password,
            });
            setCustomer(data);
            localStorage.setItem('customerInfo', JSON.stringify(data));
            return { success: true, data };
        } catch (error) {
            const retryAfterHeader = error.response?.headers?.['retry-after'];
            const retryAfterSeconds = Number(
                error.response?.data?.retryAfterSeconds
                || retryAfterHeader
                || 0,
            );

            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
                code: error.response?.data?.code
                    || (error.response?.status === 429 ? 'AUTH_RATE_LIMITED' : undefined),
                retryAfterSeconds: Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                    ? retryAfterSeconds
                    : undefined,
            };
        }
    };

    const register = async (customerData) => {
        const { data } = await axios.post('http://localhost:5000/api/customers/register', customerData);
        setCustomer(data);
        localStorage.setItem('customerInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        localStorage.removeItem('customerInfo');
        localStorage.removeItem('cart');
        setCustomer(null);
        window.dispatchEvent(new Event('storage'));
    };

    useIdleLogout({
        enabled: Boolean(customer),
        timeoutMs: IDLE_LOGOUT_TIMEOUT_MS,
        onIdle: logout,
    });

    const updateCustomerData = (updatedData) => {
        const updatedCustomer = { ...customer, ...updatedData };
        setCustomer(updatedCustomer);
        localStorage.setItem('customerInfo', JSON.stringify(updatedCustomer));
    };

    const isCustomerAuthenticated = () => !!customer;

    return (
        <CustomerContext.Provider
            value={{
                customer,
                loading,
                login,
                register,
                logout,
                updateCustomerData,
                isCustomerAuthenticated,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => useContext(CustomerContext);
