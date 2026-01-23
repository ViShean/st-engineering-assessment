// import pg from 'pg';
// import dotenv from 'dotenv';

// const { Pool } = pg;
// dotenv.config();

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// export const initDb = async() => {
//     const queryText = `
//         CREATE TABLE IF NOT EXISTS comments (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER,
//         comment_id INTEGER UNIQUE,
//         name TEXT,
//         email TEXT,
//         body TEXT,
//         uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     ); 
//     `;
//     try {
//         await pool.query(queryText);
//         console.log("Database initialized with 'comments' table");
//     } catch (err) {
//         console.error("DB Init Error:", err);
//     }
// }