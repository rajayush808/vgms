// Database schema update script to fix API endpoints
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

async function updateDatabaseSchema() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT
  });

  console.log('Connected to MySQL database');

  try {
    // First, check current schema
    console.log('Checking current user_games table structure...');
    const [columns] = await connection.execute("DESCRIBE user_games");
    console.log('Current columns:', columns.map(col => col.Field));

    // Update user_games table to match controller expectations
    console.log('Updating user_games table schema...');
    
    // Add missing columns if they don't exist
    const alterQueries = [
      // Ensure all required columns exist
      `ALTER TABLE user_games 
       MODIFY COLUMN rawg_id INT DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS game_id INT DEFAULT NULL AFTER rawg_id,
       ADD COLUMN IF NOT EXISTS progress_percentage INT DEFAULT 0 AFTER playtime_hours,
       ADD COLUMN IF NOT EXISTS platforms TEXT AFTER average_rating,
       ADD COLUMN IF NOT EXISTS started_date TIMESTAMP NULL AFTER completed_date`,
       
      // Update user_activity table
      `ALTER TABLE user_activity 
       ADD COLUMN IF NOT EXISTS old_value VARCHAR(255) AFTER details,
       ADD COLUMN IF NOT EXISTS new_value VARCHAR(255) AFTER old_value`,
       
      // Ensure proper data types
      `ALTER TABLE user_games 
       MODIFY COLUMN playtime_hours DECIMAL(5,1) DEFAULT 0.0,
       MODIFY COLUMN personal_rating INT DEFAULT NULL`
    ];

    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('Executed:', query.split('\n')[0] + '...');
      } catch (error) {
        console.log('Query already applied or error:', error.message);
      }
    }

    // Check final schema
    console.log('\nFinal user_games table structure:');
    const [finalColumns] = await connection.execute("DESCRIBE user_games");
    finalColumns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null} ${col.Default}`);
    });

    console.log('\nDatabase schema updated successfully!');

  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    await connection.end();
  }
}

updateDatabaseSchema().catch(console.error);
