// src/api.js
import axios from "axios";

// ---- already existed ----
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export async function fetchGames({ query }) {
  const response = await fetch(`${API_ENDPOINT}/api/games?search=${query}`);
  return await response.json();
}

export async function fetchGameData({ gameSlug }) {
  const response = await fetch(`${API_ENDPOINT}/game?gameSlug=${gameSlug}`);
  return await response.json();
}
// --------------------------

// ===== NEW: shared Axios client for auth & any future POST/PUT calls =====
const http = axios.create({
  baseURL: `${API_ENDPOINT}/api`, // -> http://localhost:3000/api
  withCredentials: true,
});

// *Auth* helpers -----------------------------------------------------------
export function login(credentials) {
  // POST /api/auth/login
  return http.post("/auth/login", credentials);
}

export function signup(data) {
  // POST /api/auth/signup
  return http.post("/auth/signup", data);
}

// You can attach more endpoints later:
// export const updateProfile = (data) => http.put("/users/me", data);
