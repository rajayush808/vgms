-- ============================================================================
-- VGMS COMPLETE DATABASE SCHEMA
-- Video Game Management System - Production Ready Database
-- Supports: User library, Statistics, Playtime tracking, Search, Collections
-- ============================================================================

-- Drop database if exists and recreate (CAREFUL - THIS DELETES ALL DATA!)
-- DROP DATABASE IF EXISTS vgms;
-- CREATE DATABASE vgms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE vgms;

-- Drop existing tables in correct order (foreign key dependencies)
DROP TABLE IF EXISTS collection_games;
DROP TABLE IF EXISTS user_collections;
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS user_games;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user;

-- ============================================================================
-- CORE USER SYSTEM
-- ============================================================================

-- Users table - Authentication and basic user info
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- ============================================================================
-- GAME LIBRARY SYSTEM
-- ============================================================================

-- User games library - Core game management
CREATE TABLE user_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Game identification (from RAWG API)
    game_id INT NOT NULL,                      -- RAWG game ID
    game_slug VARCHAR(255) NOT NULL,           -- RAWG game slug for URLs
    game_name VARCHAR(255) NOT NULL,           -- Game title
    game_image VARCHAR(500),                   -- Cover image URL
    
    -- Game metadata (from RAWG API)
    platforms TEXT,                            -- JSON array of platforms
    genres TEXT,                               -- JSON array of genres  
    developers TEXT,                           -- JSON array of developers
    publishers TEXT,                           -- JSON array of publishers
    release_date DATE,                         -- Game release date
    rawg_rating DECIMAL(3,2),                  -- RAWG average rating
    metacritic_score INT,                      -- Metacritic score
    
    -- User-specific data
    status ENUM('wishlist', 'playing', 'completed', 'paused', 'dropped', 'abandoned') DEFAULT 'wishlist',
    personal_rating INT CHECK (personal_rating >= 1 AND personal_rating <= 5),
    playtime_hours DECIMAL(10,2) DEFAULT 0.00, -- Precise playtime tracking
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,                                -- Personal notes/review
    is_favorite BOOLEAN DEFAULT FALSE,         -- Favorite games
    
    -- Tracking dates
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_date TIMESTAMP NULL,               -- When user started playing
    completed_date TIMESTAMP NULL,             -- When user completed
    last_played TIMESTAMP NULL,                -- Last play session
    
    -- Database constraints and indexes
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_rating (user_id, personal_rating),
    INDEX idx_user_playtime (user_id, playtime_hours),
    INDEX idx_game_slug (game_slug),
    INDEX idx_updated_date (updated_date)
);

-- ============================================================================
-- ACTIVITY TRACKING SYSTEM
-- ============================================================================

-- User activity history - Complete audit trail
CREATE TABLE user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Activity details
    activity_type ENUM(
        'game_added', 'game_removed', 'status_changed', 'game_rated', 
        'playtime_updated', 'game_completed', 'game_started', 'note_added',
        'progress_updated', 'favorite_toggled'
    ) NOT NULL,
    
    -- Game information
    game_id INT,                               -- RAWG game ID
    game_slug VARCHAR(255),                    -- Game slug
    game_name VARCHAR(255),                    -- Game name (for display)
    
    -- Change tracking
    old_value VARCHAR(500),                    -- Previous value
    new_value VARCHAR(500),                    -- New value
    details JSON,                              -- Additional metadata
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Database constraints and indexes
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at DESC),
    INDEX idx_activity_type (activity_type),
    INDEX idx_game_activity (game_slug, created_at DESC)
);

-- ============================================================================
-- COLLECTIONS SYSTEM (Future Feature)
-- ============================================================================

-- User-created game collections/lists
CREATE TABLE user_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Collection details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    game_count INT DEFAULT 0,                  -- Cached count for performance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Database constraints and indexes
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_collection (user_id, name),
    INDEX idx_user_collections (user_id, is_public)
);

-- Games in collections (many-to-many relationship)
CREATE TABLE collection_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    game_id INT NOT NULL,                      -- RAWG game ID
    game_slug VARCHAR(255) NOT NULL,           -- Game slug
    
    -- Metadata
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,                                -- Collection-specific notes
    
    -- Database constraints and indexes
    FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_collection_game (collection_id, game_id),
    INDEX idx_collection_games (collection_id, added_at DESC)
);

-- ============================================================================
-- USER PREFERENCES SYSTEM
-- ============================================================================

-- User preferences and settings
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Display preferences
    theme ENUM('dark', 'light', 'auto') DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    time_format ENUM('12h', '24h') DEFAULT '12h',
    
    -- Privacy settings
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
    library_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
    activity_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
    
    -- Notification settings
    email_notifications BOOLEAN DEFAULT TRUE,
    game_reminders BOOLEAN DEFAULT TRUE,
    achievement_notifications BOOLEAN DEFAULT TRUE,
    
    -- Gaming preferences
    preferred_platforms JSON,                  -- Array of preferred platforms
    favorite_genres JSON,                      -- Array of favorite genres
    playtime_tracking BOOLEAN DEFAULT TRUE,   -- Enable automatic playtime tracking
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Database constraints and indexes
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert a test user
INSERT INTO user (username, email, password, display_name) VALUES 
('testuser', 'test@vgms.com', '$2b$10$8eQcQoOJFzQ8ZG5QS5ZJ9.K8mHU8z7Qz3y3Zg5x2F9y8z3x7Qz9y8z', 'Test User');

-- Insert user preferences for test user
INSERT INTO user_preferences (user_id) VALUES (1);

-- ============================================================================
-- USEFUL VIEWS FOR STATISTICS
-- ============================================================================

-- User library statistics view
CREATE VIEW user_library_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(ug.id) as total_games,
    COUNT(CASE WHEN ug.status = 'completed' THEN 1 END) as completed_games,
    COUNT(CASE WHEN ug.status = 'playing' THEN 1 END) as currently_playing,
    COUNT(CASE WHEN ug.status = 'wishlist' THEN 1 END) as wishlist_games,
    COUNT(CASE WHEN ug.status = 'paused' THEN 1 END) as paused_games,
    COUNT(CASE WHEN ug.status = 'dropped' THEN 1 END) as dropped_games,
    COALESCE(SUM(ug.playtime_hours), 0) as total_playtime,
    COALESCE(AVG(ug.personal_rating), 0) as average_rating,
    COUNT(CASE WHEN ug.is_favorite = TRUE THEN 1 END) as favorite_games
FROM user u
LEFT JOIN user_games ug ON u.id = ug.user_id
GROUP BY u.id, u.username;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional performance indexes
CREATE INDEX idx_user_games_status_date ON user_games(user_id, status, updated_date DESC);
CREATE INDEX idx_user_games_rating_date ON user_games(user_id, personal_rating DESC, updated_date DESC);
CREATE INDEX idx_user_games_playtime_date ON user_games(user_id, playtime_hours DESC, updated_date DESC);
CREATE INDEX idx_user_games_completed ON user_games(user_id, completed_date DESC) WHERE status = 'completed';

-- Activity tracking indexes
CREATE INDEX idx_activity_recent ON user_activity(user_id, created_at DESC) LIMIT 1000;
CREATE INDEX idx_activity_type_user ON user_activity(activity_type, user_id, created_at DESC);

-- ============================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

DELIMITER //

-- Procedure to add a game to user library with activity logging
CREATE PROCEDURE AddGameToLibrary(
    IN p_user_id INT,
    IN p_game_id INT,
    IN p_game_slug VARCHAR(255),
    IN p_game_name VARCHAR(255),
    IN p_game_image VARCHAR(500),
    IN p_platforms TEXT,
    IN p_genres TEXT,
    IN p_status ENUM('wishlist', 'playing', 'completed', 'paused', 'dropped', 'abandoned')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert game into library
    INSERT INTO user_games (
        user_id, game_id, game_slug, game_name, game_image, 
        platforms, genres, status
    ) VALUES (
        p_user_id, p_game_id, p_game_slug, p_game_name, p_game_image,
        p_platforms, p_genres, p_status
    );
    
    -- Log the activity
    INSERT INTO user_activity (
        user_id, activity_type, game_id, game_slug, game_name, new_value
    ) VALUES (
        p_user_id, 'game_added', p_game_id, p_game_slug, p_game_name, p_status
    );
    
    COMMIT;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

DELIMITER //

-- Trigger to log activity when game status changes
CREATE TRIGGER log_status_change 
    AFTER UPDATE ON user_games
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO user_activity (
            user_id, activity_type, game_id, game_slug, game_name, 
            old_value, new_value
        ) VALUES (
            NEW.user_id, 'status_changed', NEW.game_id, NEW.game_slug, NEW.game_name,
            OLD.status, NEW.status
        );
        
        -- If completed, log completion
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            INSERT INTO user_activity (
                user_id, activity_type, game_id, game_slug, game_name
            ) VALUES (
                NEW.user_id, 'game_completed', NEW.game_id, NEW.game_slug, NEW.game_name
            );
        END IF;
    END IF;
    
    -- Log rating changes
    IF OLD.personal_rating != NEW.personal_rating OR (OLD.personal_rating IS NULL AND NEW.personal_rating IS NOT NULL) THEN
        INSERT INTO user_activity (
            user_id, activity_type, game_id, game_slug, game_name,
            old_value, new_value
        ) VALUES (
            NEW.user_id, 'game_rated', NEW.game_id, NEW.game_slug, NEW.game_name,
            COALESCE(OLD.personal_rating, ''), NEW.personal_rating
        );
    END IF;
    
    -- Log significant playtime increases (more than 1 hour)
    IF NEW.playtime_hours - OLD.playtime_hours >= 1.0 THEN
        INSERT INTO user_activity (
            user_id, activity_type, game_id, game_slug, game_name,
            old_value, new_value
        ) VALUES (
            NEW.user_id, 'playtime_updated', NEW.game_id, NEW.game_slug, NEW.game_name,
            OLD.playtime_hours, NEW.playtime_hours
        );
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- FINAL SETUP
-- ============================================================================

-- Show table structure for verification
SHOW TABLES;

-- Show sample query for user library
SELECT 'Database schema created successfully!' as status;
SELECT 'Total tables created:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE();

-- Sample query to verify everything works
SELECT 
    u.username,
    uls.total_games,
    uls.completed_games,
    uls.total_playtime
FROM user u
LEFT JOIN user_library_stats uls ON u.id = uls.user_id
LIMIT 5;
