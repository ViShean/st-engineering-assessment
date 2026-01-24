import {pgTable, serial, integer, text, timestamp, varchar} from 'drizzle-orm/pg-core';

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    postId: integer("post_id"),
    comment_id: integer("comment_id").unique(), 
    name: text("name"),
    email: text("email"),
    body: text("body"),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const metadata = pgTable('metadata', {
  key: varchar('key', { length: 50 }).primaryKey(),
  value: integer('value').notNull().default(0),
});