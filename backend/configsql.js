        //configsql.js
const { Pool } = require("pg")
require("dotenv").config({ path: "./config.env" })


const pool = new Pool({
    user: process.env.Neon_DB_USER,                             //`Neon-DB` URI details  ->...
    host: process.env.Neon_DB_HOST,
    database: process.env.Neon_DB_NAME,
    password: process.env.Neon_DB_PASSWORD,
    port: 5432,                             // Neon default port

    ssl: { rejectUnauthorized: false }     // Required for Neon
})

pool.connect()
    .then(() => console.log("Connected to Neon-PostgreSQL DB!"))
    .catch(err => console.error("Neon-PostgreSQL DB Connection error:  ", err));



// Function to create 'hackathons' table if it doesn't exist
const createUsersTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS hackathons (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL UNIQUE,
        date VARCHAR(100),
        location VARCHAR(255),
        city VARCHAR(100),
        prize VARCHAR(100),
        host VARCHAR(255)
    );
    `

    try {
        await pool.query(createTableQuery)
        console.log("`hackathons` table is ready!")
    }
    catch (err) {
        console.log("Error creating table:  ", err)
    }
}

// Run table creation when server starts
createUsersTable()


module.exports = pool