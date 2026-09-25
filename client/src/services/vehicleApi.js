import API from './api';

export const getVehicles = (params) => API.get('/vehicles', { params });
export const getVehicleById = (id) => API.get(`/vehicles/${id}`);
export const checkAvailability = (id, startDate, endDate) =>
  API.get(`/vehicles/${id}/availability`, { params: { startDate, endDate } });

export const createVehicle = (vehicleData) => API.post('/vehicles', vehicleData);
export const updateVehicle = (id, vehicleData) => API.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);
