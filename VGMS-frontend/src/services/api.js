// API service for all database operations
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
});

// Add auth header to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Game Library Management
export const gameLibraryAPI = {
  // Get user's complete library
  getUserLibrary: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/games/library?${params}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/games/stats');
    return response.data;
  },

  // Get specific game status
  getGameStatus: async (gameSlug) => {
    const response = await api.get(`/games/library/status/${gameSlug}`);
    return response.data;
  },

  // Add game to library
  addGame: async (gameData) => {
    const response = await api.post('/games/library/add', gameData);
    return response.data;
  },

  // Update game status
  updateGameStatus: async (gameSlug, statusData) => {
    const response = await api.put(`/games/library/status/${gameSlug}`, statusData);
    return response.data;
  },

  // Update game rating
  updateGameRating: async (gameSlug, rating) => {
    const response = await api.put(`/games/library/rating/${gameSlug}`, { rating });
    return response.data;
  },

  // Update game progress
  updateGameProgress: async (gameSlug, progressData) => {
    const response = await api.put(`/games/library/progress/${gameSlug}`, progressData);
    return response.data;
  },

  // Remove game from library
  removeGame: async (gameSlug) => {
    const response = await api.delete(`/games/library/remove/${gameSlug}`);
    return response.data;
  }
};

// Game Search (Public API)
export const gameSearchAPI = {
  // Search games
  searchGames: async (query) => {
    const response = await fetch(`${API_BASE}/search/games?search=${encodeURIComponent(query)}`);
    return response.json();
  },

  // Get game details
  getGameDetails: async (gameSlug) => {
    const response = await fetch(`${API_BASE}/search/game?gameSlug=${gameSlug}`);
    return response.json();
  }
};

// Authentication
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }
};

export default api;
