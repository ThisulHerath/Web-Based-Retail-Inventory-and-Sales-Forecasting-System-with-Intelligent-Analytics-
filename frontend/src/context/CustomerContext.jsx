import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
        const { data } = await axios.post('http://localhost:5000/api/customers/login', {
            email,
            password,
        });
        setCustomer(data);
        localStorage.setItem('customerInfo', JSON.stringify(data));
        return data;
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
