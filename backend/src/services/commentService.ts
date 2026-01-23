import fs from 'fs';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { db } from '../db/index.js';
import { comments } from '../db/schema.js';
import { desc } from 'drizzle-orm';

const RowSchema = z.object({
  postId: z.coerce.number({ error: "postId must be a number" }),
  id: z.coerce.number({ error: "id must be a number" }),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  body: z.string().min(1, "Body cannot be empty"),
});

export const processCsvUpload = async (filePath: string) => {
  const failedRows: { id: number | string; reason: string }[] = [];
  let successCount = 0;
  let isFirstRow = true;

  const parser = fs.createReadStream(filePath).pipe(
    parse({
        columns: true,
        skip_empty_lines: true,
        bom: true
    })
  );

  for await (const row of parser) {
    // Header Validation
    if (isFirstRow) {
        const requiredHeaders = ['postId', 'id', 'name', 'email', 'body'];
        const actualHeaders = Object.keys(row);
        const missing = requiredHeaders.filter(h => !actualHeaders.includes(h));

        if (missing.length > 0) {
        throw new Error(`Invalid CSV structure. Missing columns: ${missing.join(', ')}`);
        }
        isFirstRow = false;
    }

    // Zod Validation
    const validation = RowSchema.safeParse(row);
    if (!validation.success) {
        const errorMsg = validation.error.issues.map(e => e.message).join(", ");
        failedRows.push({ id: row.id || 'N/A', reason: `Validation: ${errorMsg}` });
        continue;
    }

    // Database Insertion & Error Handling
    try {
        const validData = validation.data;
        await db.insert(comments).values({
            postId: validData.postId,
            comment_id: validData.id,
            name: validData.name,
            email: validData.email,
            body: validData.body,
        });
      successCount++;
    } catch (err: any) {
        let reason = "Unknown Error";
        const errorCode = err.cause.code || err.driverError?.code;
        // console.log(err);
        // console.log("Full Error Keys:", Object.keys(err));
        // console.log(`[DB Error] Code: ${errorCode} | ID: ${row.id}`);
        if (errorCode === '23505') {
            reason = "Duplicate ID (Already exists)";
        } else if (errorCode === '23502') {
            reason = "Missing required field (Null violation)";
        } else if (errorCode === '22P02') {
            reason = "Invalid data format (Invalid integer or type)";
        } else if (errorCode === '08003' || errorCode === '08006') {
            reason = "Database connection lost";
        } else {
            reason = err.message || "Database execution failed";
        }
        failedRows.push({ id: parseInt(row.id) || 'N/A', reason });
    }
  }

  return {
    success: successCount,
    failed: failedRows.length,
    failures: failedRows
  };
};

export const fetchLatestComments = async () => {
    return await db.select()
        .from(comments)
        .orderBy(desc(comments.id))
        .limit(50);
};

export const wipeDatabase = async () => {
    return await db.delete(comments);
};