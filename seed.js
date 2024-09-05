require('dotenv').config(); // Add this line
const { Pool } = require('pg');

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Ensure the users table exists and seed initial data
async function seedDatabase() {
    try {
        // Create the history table without the password field
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        masks INT DEFAULT 0,
        demasks INT DEFAULT 0,
        validations INT DEFAULT 0
      );
    `;

        await pool.query(createTableQuery);
        console.log('History table created or already exists.');

        // Optionally seed the table with some initial data
        const seedDataQuery = `
        INSERT INTO history (username, email, masks, demasks, validations)
        VALUES
            ('jaiditya', 'jaiditya7318@gmail.com', 5, 3, 2)
        ON CONFLICT (username) DO NOTHING;
        `;

        await pool.query(seedDataQuery);
        console.log('Initial user data seeded.');

    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        pool.end();
    }
}

// Run the seed function
seedDatabase();