import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── User Profile ────────────────────────────────────────────────────────────

// Save user profile details (create)
export const saveUserDetails = (data) =>
    api.post('/user-details/user_data', data);

// Get all user details (used to check if profile exists for a user_id)
export const getUserDetails = () =>
    api.get('/user-details/user_details');

// Update existing user profile
export const updateUserDetails = (userId, data) =>
    api.put(`/user-details/update_user_details?user_id=${encodeURIComponent(userId)}`, data);

// ─── Recommendations ─────────────────────────────────────────────────────────

// Get personalized recommendations by user_id
export const getRecommendations = (userId) =>
    api.post(`/recomendation/recomendation?user_id=${userId}`);

// ─── Schemes ─────────────────────────────────────────────────────────────────

// Get scheme by title (also returns comments and optionally detailed eligibility matching)
export const getSchemeByTitle = (title, userId) =>
    api.post('/schemes/get_scheme_by_title', null, { params: { title, user_id: userId } });

// Get all schemes
export const getAllSchemes = () =>
    api.get('/schemes/schemes');

// Get all schemes details for autocomplete
export const getAllSchemesData = () =>
    api.get('/schemes/all_schemes_data');

// NLP search schemes
export const searchSchemes = (query, userId) =>
    api.post('/schemes/search_schemes', null, { params: { query, user_id: userId } });

// ─── Liked Schemes ───────────────────────────────────────────────────────────

// Get liked schemes for a user
export const getLikedSchemes = (userId) =>
    api.get('/schemes/get_liked_schemes', { params: { user_id: userId } });

// Like a scheme
export const likeScheme = (userId, schemeTitle) =>
    api.post('/schemes/like_scheme', null, { params: { user_id: userId, scheme_title: schemeTitle } });

// Unlike a scheme
export const unlikeScheme = (userId, schemeTitle) =>
    api.post('/schemes/unlike_scheme', null, { params: { user_id: userId, scheme_title: schemeTitle } });

// ─── Comments ────────────────────────────────────────────────────────────────

// Post a comment on a scheme
export const postComment = (comment, title, userId) =>
    api.post('/comments/comment', null, { params: { comment, title, user_id: userId } });

// Submit a new proposed scheme
export const proposeScheme = (data) =>
    api.post('/schemes/propose_scheme', data);

export default api;
export const getProposedSchemes = () => api.get('/schemes/get_proposed_schemes', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' } });
