import UserGame from '../models/userGameModel.js'; // You need to create this model

// Get user's complete library
export const getUserLibrary = async (req, res) => {
  try {
    const userId = req.user._id; // changed from req.user.id
    const { status, sortBy = 'updated_date', order = 'DESC', limit, offset = 0 } = req.query;

    const filter = { user_id: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Sort options
    const validSortFields = ['added_date', 'updated_date', 'game_name', 'personal_rating', 'playtime_hours'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'updated_date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 1 : -1;

    const query = UserGame.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(parseInt(offset));

    if (limit) {
      query.limit(parseInt(limit));
    }

    const games = await query.exec();
    const total = await UserGame.countDocuments(filter);

    res.json({
      games,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : total,
        offset: parseInt(offset),
        hasMore: limit ? (parseInt(offset) + parseInt(limit)) < total : false
      }
    });
  } catch (error) {
    console.error('Error getting user library:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user's gaming statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id; // changed from req.user.id
    const filter = { user_id: userId };

    const stats = await UserGame.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          gamesCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          gamesPlaying: { $sum: { $cond: [{ $eq: ['$status', 'playing'] }, 1, 0] } },
          wishlistGames: { $sum: { $cond: [{ $eq: ['$status', 'wishlist'] }, 1, 0] } },
          droppedGames: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } },
          pausedGames: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
          totalPlaytime: { $sum: { $ifNull: ['$playtime_hours', 0] } },
          averageRating: { $avg: '$personal_rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalGames: 0,
      gamesCompleted: 0,
      gamesPlaying: 0,
      wishlistGames: 0,
      droppedGames: 0,
      pausedGames: 0,
      totalPlaytime: 0,
      averageRating: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Placeholder functions for other routes (implement as needed)
export const addGameToLibrary = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const removeGameFromLibrary = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const updateGameStatus = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const updateGameRating = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const updateGameProgress = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const getGameStatus = async (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
};
