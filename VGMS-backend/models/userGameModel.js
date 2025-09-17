import mongoose from 'mongoose';

const userGameSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game_id: { type: String, required: true },
  game_slug: { type: String },
  game_name: { type: String, required: true },
  game_image: { type: String },
  status: { type: String, required: true }, // e.g., 'completed', 'playing', etc.
  personal_rating: { type: Number },
  playtime_hours: { type: Number },
  progress_percentage: { type: Number },
  notes: { type: String },
  platforms: [{ type: String }],
  genres: [{ type: String }],
  added_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  started_date: { type: Date },
  completed_date: { type: Date }
});

userGameSchema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

const UserGame = mongoose.model('UserGame', userGameSchema);

export default UserGame;
