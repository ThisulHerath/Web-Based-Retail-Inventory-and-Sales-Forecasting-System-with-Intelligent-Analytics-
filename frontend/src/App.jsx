import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesList from './pages/SalesList';
import CreateSale from './pages/CreateSale';
import ViewSale from './pages/ViewSale';
import EditSale from './pages/EditSale';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import StockHistory from './pages/StockHistory';
import Suppliers from './pages/Suppliers';
import CreateSupplier from './pages/CreateSupplier';
import EditSupplier from './pages/EditSupplier';
import ViewSupplier from './pages/ViewSupplier';
import Purchases from './pages/Purchases';
import CreatePurchase from './pages/CreatePurchase';
import ViewPurchase from './pages/ViewPurchase';
import Categories from './pages/Categories';
import CreateCategory from './pages/CreateCategory';
import EditCategory from './pages/EditCategory';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import EditCustomer from './pages/EditCustomer';
import ValidateCoupon from './pages/ValidateCoupon';

// Public pages
import Home from './pages/Home';
import PublicProducts from './pages/PublicProducts';
import Cart from './pages/Cart';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {
    const { user, loading } = useAuth();

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
