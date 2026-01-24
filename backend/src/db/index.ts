import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import dotenv from "dotenv";
import {eq} from 'drizzle-orm';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const initializeMetadata = async () => {
  const existing = await db.select().from(schema.metadata).where(eq(schema.metadata.key, 'total_comments'));
  
  if (existing.length === 0) {
    // If the key does not exist, seed it with 0
    await db.insert(schema.metadata).values({
      key: 'total_comments',
      value: 0
    });
  }
};

export const db = drizzle(pool, { schema });