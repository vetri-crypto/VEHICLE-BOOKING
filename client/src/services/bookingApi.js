import API from './api';

export const createBooking = (bookingData) => API.post('/bookings', bookingData);
export const getMyBookings = () => API.get('/bookings');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
