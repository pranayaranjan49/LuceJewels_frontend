import api from './client';

// --- Auth ---
export const simpleLogin = (payload) => api.post('/auth/login', payload);
export const sendOtp = (payload) => api.post('/auth/send-otp', payload);
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload);
export const getMe = () => api.get('/auth/me');

// --- Categories ---
export const getCategories = () => api.get('/categories');
export const createCategory = (formData) =>
  api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, formData) =>
  api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// --- Products ---
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getLowStock = () => api.get('/products/low-stock');
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStock = (id, payload) => api.patch(`/products/${id}/stock`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- Orders ---
export const createOrder = (payload) => api.post('/orders', payload);
export const getMyOrders = () => api.get('/orders/my');
export const getAllOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// --- Users ---
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);

// --- Campaigns ---
export const sendCampaign = (payload) => api.post('/campaigns/send', payload);
export const getCampaigns = () => api.get('/campaigns');
