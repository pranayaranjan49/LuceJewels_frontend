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
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getAllOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const addTrackingUpdate = (id, payload) => api.post(`/orders/${id}/tracking`, payload);
export const cancelOrder = (id, reason) => api.patch(`/orders/${id}/cancel`, { reason });
export const submitFeedback = (id, formData) =>
  api.post(`/orders/${id}/feedback`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const markComplaintSeen = (id) => api.patch(`/orders/${id}/complaint-seen`);

// --- Profile (name/phone, addresses, secondary phones) ---
export const getProfile = () => api.get('/profile');
export const updateProfile = (payload) => api.patch('/profile', payload);
export const addAddress = (payload) => api.post('/profile/addresses', payload);
export const updateAddress = (addressId, payload) => api.put(`/profile/addresses/${addressId}`, payload);
export const deleteAddress = (addressId) => api.delete(`/profile/addresses/${addressId}`);
export const addPhone = (payload) => api.post('/profile/phones', payload);
export const setPrimaryPhone = (phoneId) => api.patch(`/profile/phones/${phoneId}/primary`);
export const deletePhone = (phoneId) => api.delete(`/profile/phones/${phoneId}`);

// --- Users ---
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);

// --- Campaigns ---
export const sendCampaign = (payload) => api.post('/campaigns/send', payload);
export const getCampaigns = () => api.get('/campaigns');

// --- Subscribers (newsletter signups, no account required) ---
export const subscribe = (payload) => api.post('/subscribers', payload);
export const getSubscribers = () => api.get('/subscribers');

// --- Homepage Banners ---
export const getBanners = () => api.get('/banners');
export const getAllBannersAdmin = () => api.get('/banners/admin');
export const createBanner = (formData) =>
  api.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBanner = (id, formData) =>
  api.put(`/banners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBanner = (id) => api.delete(`/banners/${id}`);
