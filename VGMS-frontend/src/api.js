// src/api.js
import axios from "axios";

// ---- already existed ----
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export async function fetchGames({ query }) {
  const response = await fetch(`${API_ENDPOINT}/api/search/games?search=${query}`);
  return await response.json();
}

export async function fetchGameData({ gameSlug }) {
  const response = await fetch(`${API_ENDPOINT}/api/search/game?gameSlug=${gameSlug}`);
  return await response.json();
}
// --------------------------

// ===== NEW: shared Axios client for auth & any future POST/PUT calls =====
const http = axios.create({
  baseURL: `${API_ENDPOINT}/api`, // -> http://localhost:3001/api
  withCredentials: true,
});

// Add token to requests
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_BASE_URL = 'http://localhost:3000/api/auth'; // Set correct backend URL

// *Auth* helpers -----------------------------------------------------------
export async function login(data) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
  
}

export async function home(){
  const response = await fetch(`${API_BASE_URL}/home`);
  if (!response.ok) {
    throw new Error('Failed to fetch home data');
  }
  console.log("Home data fetched successfully");
  return response.text(); 
}

export async function signup(data) {
  return fetch(`${API_BASE_URL}/signup`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// *Game Library* helpers ---------------------------------------------------
export function addGameToLibrary(gameData) {
  // POST /api/games/library/add
  return http.post("/games/library/add", gameData);
}

export function removeGameFromLibrary(gameSlug) {
  // DELETE /api/games/library/remove/:gameSlug
  return http.delete(`/games/library/remove/${gameSlug}`);
}

export function updateGameStatus(gameSlug, status, notes) {
  // PUT /api/games/library/status/:gameSlug
  return http.put(`/games/library/status/${gameSlug}`, { status, notes });
}

export function updateGameRating(gameSlug, rating) {
  // PUT /api/games/library/rating/:gameSlug
  return http.put(`/games/library/rating/${gameSlug}`, { rating });
}

export function updateGameProgress(gameSlug, progressData) {
  // PUT /api/games/library/progress/:gameSlug
  return http.put(`/games/library/progress/${gameSlug}`, progressData);
}

export function getUserLibrary(params = {}) {
  // GET /api/games/library
  return http.get("/games/library", { params });
}

export function getGameLibraryStatus(gameSlug) {
  // GET /api/games/library/status/:gameSlug
  return http.get(`/games/library/status/${gameSlug}`);
}

export function getUserStats() {
  // GET /api/games/stats
  return http.get("/games/stats");
}
