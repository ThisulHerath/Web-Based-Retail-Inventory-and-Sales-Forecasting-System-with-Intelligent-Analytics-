import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import SalesList from './pages/sales/SalesList';
import CreateSale from './pages/sales/CreateSale';
import ViewSale from './pages/sales/ViewSale';
import EditSale from './pages/sales/EditSale';
import Users from './pages/users/Users';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';
import Products from './pages/inventory/Products';
import CreateProduct from './pages/inventory/CreateProduct';
import EditProduct from './pages/inventory/EditProduct';
import StockIn from './pages/inventory/StockIn';
import StockOut from './pages/inventory/StockOut';
import StockHistory from './pages/inventory/StockHistory';
import Suppliers from './pages/suppliers/Suppliers';
import CreateSupplier from './pages/suppliers/CreateSupplier';
import EditSupplier from './pages/suppliers/EditSupplier';
import ViewSupplier from './pages/suppliers/ViewSupplier';
import Purchases from './pages/purchases/Purchases';
import CreatePurchase from './pages/purchases/CreatePurchase';
import ViewPurchase from './pages/purchases/ViewPurchase';
import Categories from './pages/categories/Categories';
import CreateCategory from './pages/categories/CreateCategory';
import EditCategory from './pages/categories/EditCategory';
import Inventory from './pages/inventory/Inventory';
import InventoryReports from './pages/inventory/InventoryReports';
import Customers from './pages/customers/Customers';
import EditCustomer from './pages/customers/EditCustomer';
import ValidateCoupon from './pages/coupons/ValidateCoupon';

// Public pages
import Home from './pages/public/Home';
import Feedback from './pages/public/Feedback';
import PublicProducts from './pages/public/PublicProducts';
import Cart from './pages/public/Cart';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';

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
    );
}

export default App;
