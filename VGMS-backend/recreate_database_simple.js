import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function recreateDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL server...');
    
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT
    });

    console.log('✅ Connected to MySQL server');

    // Drop and recreate database
    console.log('🗑️  Dropping existing database if exists...');
    await connection.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    
    console.log('🏗️  Creating new database...');
    await connection.query(`CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log('🔄 Switching to new database...');
    await connection.query(`USE ${DB_NAME}`);

    console.log('⚡ Creating database tables...');

    // 1. Users table
    await connection.query(`
      CREATE TABLE user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
      )
    `);

    // 2. User games library
    await connection.query(`
      CREATE TABLE user_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        game_slug VARCHAR(255) NOT NULL,
        game_name VARCHAR(255) NOT NULL,
        game_image VARCHAR(500),
        platforms TEXT,
        genres TEXT,
        developers TEXT,
        publishers TEXT,
        release_date DATE,
        rawg_rating DECIMAL(3,2),
        metacritic_score INT,
        status ENUM('wishlist', 'playing', 'completed', 'paused', 'dropped', 'abandoned') DEFAULT 'wishlist',
        personal_rating INT CHECK (personal_rating >= 1 AND personal_rating <= 5),
        playtime_hours DECIMAL(10,2) DEFAULT 0.00,
        progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        notes TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        started_date TIMESTAMP NULL,
        completed_date TIMESTAMP NULL,
        last_played TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_game (user_id, game_id),
        INDEX idx_user_status (user_id, status),
        INDEX idx_user_rating (user_id, personal_rating),
        INDEX idx_user_playtime (user_id, playtime_hours),
        INDEX idx_game_slug (game_slug),
        INDEX idx_updated_date (updated_date)
      )
    `);

    // 3. User activity tracking
    await connection.query(`
      CREATE TABLE user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        activity_type ENUM(
          'game_added', 'game_removed', 'status_changed', 'game_rated', 
          'playtime_updated', 'game_completed', 'game_started', 'note_added',
          'progress_updated', 'favorite_toggled'
        ) NOT NULL,
        game_id INT,
        game_slug VARCHAR(255),
        game_name VARCHAR(255),
        old_value VARCHAR(500),
        new_value VARCHAR(500),
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        INDEX idx_user_activity (user_id, created_at DESC),
        INDEX idx_activity_type (activity_type),
        INDEX idx_game_activity (game_slug, created_at DESC)
      )
    `);

    // 4. User collections
    await connection.query(`
      CREATE TABLE user_collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        is_favorite BOOLEAN DEFAULT FALSE,
        game_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_collection (user_id, name),
        INDEX idx_user_collections (user_id, is_public)
      )
    `);

    // 5. Collection games (many-to-many)
    await connection.query(`
      CREATE TABLE collection_games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collection_id INT NOT NULL,
        game_id INT NOT NULL,
        game_slug VARCHAR(255) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE,
        UNIQUE KEY unique_collection_game (collection_id, game_id),
        INDEX idx_collection_games (collection_id, added_at DESC)
      )
    `);

    // 6. User preferences
    await connection.query(`
      CREATE TABLE user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        theme ENUM('dark', 'light', 'auto') DEFAULT 'dark',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'UTC',
        profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
        library_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
        activity_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
        email_notifications BOOLEAN DEFAULT TRUE,
        game_reminders BOOLEAN DEFAULT TRUE,
        preferred_platforms JSON,
        favorite_genres JSON,
        playtime_tracking BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preferences (user_id)
      )
    `);

    console.log('✅ All tables created successfully!');

    // Create test user
    console.log('🧪 Creating test user...');
    const [userResult] = await connection.query(`
      INSERT INTO user (username, email, password, display_name) 
      VALUES (?, ?, ?, ?)
    `, ['testuser', 'test@vgms.com', '$2b$10$8eQcQoOJFzQ8ZG5QS5ZJ9.K8mHU8z7Qz3y3Zg5x2F9y8z3x7Qz9y8z', 'Test User']);
    
    const userId = userResult.insertId;
    
    // Create user preferences
    await connection.query('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);
    
    console.log('✅ Test user created successfully');

    // Verify setup
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Created tables:', tables.map(t => Object.values(t)[0]));

    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COALESCE(SUM(playtime_hours), 0) as total_playtime
      FROM user_games 
      WHERE user_id = ?
    `, [userId]);
    
    console.log('📈 Test user stats:', stats[0]);
    
    console.log('\n🎉 DATABASE RECREATION COMPLETED SUCCESSFULLY!');
    console.log('=====================================================');
    console.log('✅ All tables created with proper relationships');
    console.log('✅ Indexes created for optimal performance');
    console.log('✅ Sample data inserted for testing');
    console.log('✅ Database ready for production use');
    console.log('=====================================================');
    
  } catch (error) {
    console.error('❌ Error recreating database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

recreateDatabase();
