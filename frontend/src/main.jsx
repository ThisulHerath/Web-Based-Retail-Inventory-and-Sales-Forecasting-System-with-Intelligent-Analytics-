import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './ui.css';
import './i18n/index.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ErrorBoundaryComponent from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundaryComponent>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <CustomerProvider>
                            <App />
                        </CustomerProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundaryComponent>
    </React.StrictMode>
);

