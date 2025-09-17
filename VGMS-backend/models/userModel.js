import mongoose from 'mongoose';

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const createUser = async (username, email, hashedPassword) => {
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  return user._id;
};
