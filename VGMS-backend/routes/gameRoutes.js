import express from 'express';
import { 
  addGameToLibrary, 
  removeGameFromLibrary, 
  updateGameStatus, 
  updateGameRating,
  updateGameProgress,
  getUserLibrary,
  getGameStatus,
  getUserStats
} from '../controllers/gameController.js';
import { authenticateToken } from '../middleware/authMiddlerware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Add game to user's library
router.post('/library/add', addGameToLibrary);

// Remove game from user's library
router.delete('/library/remove/:gameSlug', removeGameFromLibrary);

// Update game status (wishlist, playing, completed, etc.)
router.put('/library/status/:gameSlug', updateGameStatus);

// Update game rating
router.put('/library/rating/:gameSlug', updateGameRating);

// Update game progress
router.put('/library/progress/:gameSlug', updateGameProgress);

// Get user's complete library
router.get('/library', getUserLibrary);

// Get specific game status for user
router.get('/library/status/:gameSlug', getGameStatus);

// Get user's gaming statistics
router.get('/stats', getUserStats);

export default router;
