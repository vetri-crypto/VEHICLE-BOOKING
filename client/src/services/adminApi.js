import API from './api';

export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminUsers = () => API.get('/admin/users');
export const createAdminUser = (userData) => API.post('/admin/users', userData);
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const updateAdminUserStatus = (id, status) => API.put(`/admin/users/${id}/status`, { status });
export const getAdminVehicles = () => API.get('/admin/vehicles');
export const getAdminBookings = () => API.get('/admin/bookings');
export const updateBookingStatus = (id, status) => API.put(`/admin/bookings/${id}/status`, { status });
export const getAdminReports = () => API.get('/admin/reports');

