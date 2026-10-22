import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import DashboardLayout from './src/layouts/DashboardLayout';
import CreateCategory from './src/pages/categories/CreateCategory';
import CreateSupplier from './src/pages/suppliers/CreateSupplier';
import RouteExperience from './src/components/RouteExperience';
import './src/index.css';
import './src/ui.css';
const previous = {token: localStorage.getItem('token'), user: localStorage.getItem('user')};
localStorage.setItem('token', 'ui-fixture-only');
localStorage.setItem('user', JSON.stringify({name:'Preview User',email:'preview@example.test',role:'admin'}));
function Fixture() {
 useEffect(() => { for (const [key,value] of Object.entries(previous)) { if(value === null) localStorage.removeItem(key); else localStorage.setItem(key,value); } }, []);
 return <AuthProvider><BrowserRouter><RouteExperience /><DashboardLayout><Routes><Route path="/admin/suppliers/*" element={<CreateSupplier />} /><Route path="*" element={<CreateCategory />} /></Routes></DashboardLayout></BrowserRouter></AuthProvider>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
