import API from './api';

export const createReview = (reviewData) => API.post('/reviews', reviewData);
export const getVehicleReviews = (vehicleId) => API.get(`/reviews/vehicles/${vehicleId}/reviews`);
