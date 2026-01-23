import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
dotenv.config({ path: '../.env' });
const host = process.env.DB_HOST || 'localhost';
export default defineConfig({
  // Point to where your schema file is located
  schema: './src/db/schema.ts',
  
  // Where the generated migration files will go
  out: './drizzle',
  
  dialect: 'postgresql',
  dbCredentials: {
    // Ensure this matches the variable in your .env file
    url: `${process.env.DATABASE_URL}`,  
    },
  
  // Highlighting this for your SIT project:
  // verbose: true helps you see the exact SQL being pushed
  verbose: true,
  strict: true,
});