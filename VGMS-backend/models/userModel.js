import { db } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]); // ✅ table = user
  return rows[0];
};

export const createUser = async (username, email, hashedPassword) => {
  const [result] = await db.query(
    'INSERT INTO user (username, email, password) VALUES (?, ?, ?)', // ✅ table & column = username
    [username, email, hashedPassword]
  );
  return result.insertId;
};
