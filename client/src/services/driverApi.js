import API from './api';

export const getDriverDashboard = () => API.get('/driver/dashboard');
export const getDriverBookings = (params) => API.get('/driver/bookings', { params });
export const acceptBooking = (id) => API.put(`/driver/bookings/${id}/accept`);
export const startBooking = (id) => API.put(`/driver/bookings/${id}/start`);
export const completeBooking = (id) => API.put(`/driver/bookings/${id}/complete`);
export const updateDriverStatus = (driverStatus) => API.put('/driver/status', { driverStatus });
