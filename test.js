// test.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function fetchAllRecords() {
    try {
        // Connect to the database
        await pool.connect();
        console.log("Connected to the database");

        // Query to fetch all records from the history table
        const res = await pool.query('SELECT * FROM history');

        // Print all records
        console.log("All records in the history table:");
        console.log(res.rows);

    } catch (err) {
        console.error("Error fetching records:", err);
    } finally {
        // End the database connection
        await pool.end();
        console.log("Database connection closed");
    }
}

// Execute the function
fetchAllRecords();