import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CustomerContext = createContext();
import { createSessionTimeout } from '../utils/sessionTimeout';
import SessionTimeoutWarning from '../components/SessionTimeoutWarning';

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [sessionTimeoutManager, setSessionTimeoutManager] = useState(null);

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
                    showTimeoutWarning,
                    setShowTimeoutWarning,
                    sessionTimeoutManager,
                }}
            >
        </CustomerContext.Provider>
            // Initialize session timeout when customer logs in
            useEffect(() => {
                if (!customer) {
                    // Cleanup on logout
                    if (sessionTimeoutManager) {
                        sessionTimeoutManager.stopTracking();
                        setSessionTimeoutManager(null);
                    }
                    setShowTimeoutWarning(false);
                    return;
                }

                // Create and start session timeout manager
                const manager = createSessionTimeout(
                    () => setShowTimeoutWarning(true), // onWarning callback
                    () => logout() // onLogout callback
                );

                manager.startTracking();
                setSessionTimeoutManager(manager);

                // Cleanup on unmount
                return () => {
                    manager.stopTracking();
                };
            }, [customer]);

    );
};

    // Initialize session timeout when customer logs in
    useEffect(() => {
        if (!customer) {
            // Cleanup on logout
            if (sessionTimeoutManager) {
                sessionTimeoutManager.stopTracking();
                setSessionTimeoutManager(null);
            }
            setShowTimeoutWarning(false);
            return;
        }

        // Create and start session timeout manager
        const manager = createSessionTimeout(
            () => setShowTimeoutWarning(true), // onWarning callback
            () => logout() // onLogout callback
        );

        manager.startTracking();
        setSessionTimeoutManager(manager);

        // Cleanup on unmount
        return () => {
            manager.stopTracking();
        };
    }, [customer]);

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
                showTimeoutWarning,
                setShowTimeoutWarning,
                sessionTimeoutManager,
            }}
        >
            {children}
            <SessionTimeoutWarning
                isVisible={showTimeoutWarning}
                onExtendSession={() => {
                    sessionTimeoutManager?.extendSession();
                    setShowTimeoutWarning(false);
                }}
                onLogout={logout}
                userType="customer"
            />
        </CustomerContext.Provider>
    );
export const useCustomer = () => useContext(CustomerContext);
