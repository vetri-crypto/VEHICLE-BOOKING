import API from './api';

export const getUserProfile = (id) => API.get(`/users/${id}`);
export const updateUserProfile = (id, userData) => API.put(`/users/${id}`, userData);
export const getAllUsers = () => API.get('/users');
export const getAvailableDrivers = () => API.get('/users/drivers/available');
export const deleteUser = (id) => API.delete(`/users/${id}`);
