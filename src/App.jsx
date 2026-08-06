import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { ProtectedRoute, AdminRoute } from './components/ui/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCampaigns from './pages/admin/AdminCampaigns';

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#240606',
            color: '#dcdbd8',
            border: '1px solid #641d1f',
          },
        }}
      />
      <Routes>
        {/* Storefront */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
        </Route>
      </Routes>
    </>
  );
}
