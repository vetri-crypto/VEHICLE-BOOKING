import API from './api';

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const logoutUser = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
