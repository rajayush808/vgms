// Importing required packages using ES module syntax
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Import auth routes
import authRoutes from './routes/authRoutes.js';

dotenv.config(); // Load environment variables from .env

const { API_KEY, CLIENT_DOMAIN } = process.env;
const app = express();

/* ─────────────────── Global middleware ─────────────────── */
app.use(express.json()); // Parse JSON bodies

/* ─────────────────── CORS configuration ─────────────────── */
const corsOptions = {
  origin: CLIENT_DOMAIN || 'http://localhost:5173', // Allow only the trusted client domain (fallback for dev)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for pre‑flight
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true,
  // Uncomment the next line *only* if you switch to cookie‑based auth and call Axios with `withCredentials: true`
  // credentials: true,
};

app.use(cors(corsOptions));
// Explicitly answer stray OPTIONS pre‑flight requests
app.options('*', cors(corsOptions));

/* ─────────────────── Rate Limiting ─────────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

/* ─────────────────── Routes ─────────────────── */
app.use('/api/auth', authRoutes);

// Games list (RAWG search)
app.get('/api/games', async (req, res) => {
  const { search: searchQuery = '' } = req.query;
  if (!API_KEY) return res.status(500).json({ error: 'API key not found in environment variables' });

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(searchQuery)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error('Failed to fetch data from external API');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data from API:', err);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// Single game details (RAWG)
app.get('/api/game', async (req, res) => {
  const { gameSlug } = req.query;
  if (!API_KEY) return res.status(500).json({ error: 'API key not found in environment variables' });

  try {
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameSlug}?key=${API_KEY}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error('Failed to fetch data from external API');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data from API:', err);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

/* ─────────────────── Basic route ─────────────────── */
app.get('/', (_req, res) => {
  res.send('Welcome to the Express App with CORS, Rate Limiting, API Integration, and Authentication!');
});

/* ─────────────────── Start server ─────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
