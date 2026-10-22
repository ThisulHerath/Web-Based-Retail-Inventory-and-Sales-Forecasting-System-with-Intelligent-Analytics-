import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RouteExperience from './components/RouteExperience';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ChangePassword = lazy(() => import('./pages/admin/ChangePassword'));
const AIPrediction = lazy(() => import('./pages/admin/AIPrediction'));
const SalesList = lazy(() => import('./pages/sales/SalesList'));
const CreateSale = lazy(() => import('./pages/sales/CreateSale'));
const ViewSale = lazy(() => import('./pages/sales/ViewSale'));
const EditSale = lazy(() => import('./pages/sales/EditSale'));
const Users = lazy(() => import('./pages/users/Users'));
const CreateUser = lazy(() => import('./pages/users/CreateUser'));
const EditUser = lazy(() => import('./pages/users/EditUser'));
const Products = lazy(() => import('./pages/inventory/Products'));
const CreateProduct = lazy(() => import('./pages/inventory/CreateProduct'));
const EditProduct = lazy(() => import('./pages/inventory/EditProduct'));
const StockIn = lazy(() => import('./pages/inventory/StockIn'));
const StockOut = lazy(() => import('./pages/inventory/StockOut'));
const StockHistory = lazy(() => import('./pages/inventory/StockHistory'));
const Suppliers = lazy(() => import('./pages/suppliers/Suppliers'));
const CreateSupplier = lazy(() => import('./pages/suppliers/CreateSupplier'));
const EditSupplier = lazy(() => import('./pages/suppliers/EditSupplier'));
const ViewSupplier = lazy(() => import('./pages/suppliers/ViewSupplier'));
const Purchases = lazy(() => import('./pages/purchases/Purchases'));
const CreatePurchase = lazy(() => import('./pages/purchases/CreatePurchase'));
const ViewPurchase = lazy(() => import('./pages/purchases/ViewPurchase'));
const Categories = lazy(() => import('./pages/categories/Categories'));
const CreateCategory = lazy(() => import('./pages/categories/CreateCategory'));
const EditCategory = lazy(() => import('./pages/categories/EditCategory'));
const Inventory = lazy(() => import('./pages/inventory/Inventory'));
const InventoryReports = lazy(() => import('./pages/inventory/InventoryReports'));
const Customers = lazy(() => import('./pages/customers/Customers'));
const EditCustomer = lazy(() => import('./pages/customers/EditCustomer'));
const ValidateCoupon = lazy(() => import('./pages/coupons/ValidateCoupon'));

// Public pages
const Home = lazy(() => import('./pages/public/Home'));
const Feedback = lazy(() => import('./pages/public/Feedback'));
const PublicProducts = lazy(() => import('./pages/public/PublicProducts'));
const Cart = lazy(() => import('./pages/public/Cart'));
const CustomerLogin = lazy(() => import('./pages/customer/CustomerLogin'));
const CustomerRegister = lazy(() => import('./pages/customer/CustomerRegister'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));

function App() {
    const { user, loading } = useAuth();
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        document.body.style.fontFamily = i18n.language === 'si'
            ? "'Noto Sans Sinhala', sans-serif"
            : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";
    }, [i18n.language]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <>
        <RouteExperience />
        <Suspense fallback={<div role="status" className="route-loading">Loading page…</div>}>
        <Routes>
            {/* ========== PUBLIC WEBSITE ROUTES ========== */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/products" element={<PublicProducts />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-account" element={<CustomerDashboard />} />
            </Route>

            {/* ========== CUSTOMER AUTH (full-screen, no navbar) ========== */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />

            {/* ========== ADMIN LOGIN ========== */}
            <Route
                path="/admin/login"
                element={<Login />}
            />

            {/* ========== ADMIN PANEL ROUTES ========== */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Outlet />
                        </DashboardLayout>
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="change-password" element={<ChangePassword />} />

                {/* AI Prediction Route (Admin Only) */}
                <Route
                    path="ai-prediction"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AIPrediction />
                        </ProtectedRoute>
                    }
                />

                {/* Sales Routes */}
                <Route path="sales" element={<SalesList />} />
                <Route path="sales/create" element={<CreateSale />} />
                <Route path="sales/:id" element={<ViewSale />} />
                <Route
                    path="sales/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <EditSale />
                        </ProtectedRoute>
                    }
                />

                {/* Customer Management Routes (Admin & Manager & Cashier view) */}
                <Route
                    path="customers"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                            <Customers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="customers/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <EditCustomer />
                        </ProtectedRoute>
                    }
                />

                {/* Validate Coupon (Cashier, Manager, Admin) */}
                <Route
                    path="validate-coupon"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                            <ValidateCoupon />
                        </ProtectedRoute>
                    }
                />

                {/* User Management Routes (Admin Only) */}
                <Route
                    path="users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Users />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users/create"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CreateUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <EditUser />
                        </ProtectedRoute>
                    }
                />

                {/* Inventory Management Routes (Admin & Manager) */}
                <Route
                    path="products"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <Products />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="products/create"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <CreateProduct />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="products/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <EditProduct />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="products/:id/stock-in"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockIn />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="products/:id/stock-out"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockOut />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="products/:id/history"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="inventory/:id/stock-in"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockIn />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="inventory/:id/stock-out"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockOut />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="inventory/:id/history"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <StockHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="inventory/reports"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <InventoryReports />
                        </ProtectedRoute>
                    }
                />

                {/* Supplier Routes (Admin & Manager) */}
                <Route
                    path="suppliers"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <Suppliers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="suppliers/create"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <CreateSupplier />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="suppliers/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <EditSupplier />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="suppliers/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <ViewSupplier />
                        </ProtectedRoute>
                    }
                />

                {/* Purchase Routes (Admin & Manager) */}
                <Route
                    path="purchases"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <Purchases />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="purchases/create"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <CreatePurchase />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="purchases/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <ViewPurchase />
                        </ProtectedRoute>
                    }
                />

                {/* Category Routes (Admin & Manager) */}
                <Route
                    path="categories"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <Categories />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="categories/create"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <CreateCategory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="categories/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <EditCategory />
                        </ProtectedRoute>
                    }
                />

                {/* Inventory Route (Admin & Manager) */}
                <Route
                    path="inventory"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Legacy redirects (old routes -> new admin routes) */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/sales" element={<Navigate to="/admin/sales" replace />} />
            <Route path="/sales/*" element={<Navigate to="/admin/sales" replace />} />
            <Route path="/users" element={<Navigate to="/admin/users" replace />} />
            <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
            <Route path="/suppliers" element={<Navigate to="/admin/suppliers" replace />} />
            <Route path="/purchases" element={<Navigate to="/admin/purchases" replace />} />
            <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />
            <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        </>
    );
}

export default App;
