-- Enhanced database schema for VGMS
-- Run these SQL commands to add new tables for game management

-- User games library table
CREATE TABLE user_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    game_slug VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    game_image VARCHAR(500),
    status ENUM('wishlist', 'playing', 'completed', 'dropped', 'paused') DEFAULT 'wishlist',
    personal_rating INT CHECK (personal_rating >= 1 AND personal_rating <= 5),
    playtime_hours DECIMAL(10,2) DEFAULT 0,
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    platforms VARCHAR(500),
    genres VARCHAR(500),
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_date DATETIME NULL,
    completed_date DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_slug),
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_rating (user_id, personal_rating)
);

-- User activity/history tracking
CREATE TABLE user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('game_added', 'game_completed', 'game_rated', 'game_removed', 'status_changed', 'progress_updated') NOT NULL,
    game_slug VARCHAR(255),
    game_name VARCHAR(255),
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_activity_type (activity_type)
);

-- Game collections/lists (for future features like custom lists)
CREATE TABLE user_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_collections (user_id)
);

-- Games in collections (many-to-many relationship)
CREATE TABLE collection_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    game_slug VARCHAR(255) NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_collection_game (collection_id, game_slug)
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferred_platforms JSON,
    favorite_genres JSON,
    privacy_settings JSON,
    notification_settings JSON,
    theme_preference VARCHAR(50) DEFAULT 'dark',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);
