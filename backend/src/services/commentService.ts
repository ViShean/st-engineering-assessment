import fs from 'fs';
import { parse } from 'csv-parse';
import { z } from 'zod';
import { db } from '../db/index.js';
import { comments, metadata } from '../db/schema.js';
import { count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { setProgress, clearProgressLater } from './progressStore.js';




const RowSchema = z.object({
  postId: z.preprocess(
    (val) => (val === null || val === undefined || val === "" ? undefined : val),
    z.coerce.number({ message: "postId must be a number" })
  ),
  id: z.preprocess(
    (val) => (val === null || val === undefined || val === "" ? undefined : val),
    z.coerce.number({ message: "id must be a number" })
  ),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format").min(1, "Email is required"),
  body: z.string().min(1, "Body cannot be empty"),
});

const escapeLike = (str: string) => str.replace(/[%_]/g, '\\$&'); //escape % and _ , which are wildcards that would return everything


export const processCsvUpload = async (filePath: string, jobId?: string) => {
  const failedRows: { id: number | string; reason: string; originalRow: Record<string, string> }[] = [];
  let successCount = 0;
    let isFirstRow = true;

    const rows: any[] = [];
    const parser = fs.createReadStream(filePath).pipe(
        parse({ columns: true, skip_empty_lines: true, bom: true })
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
        rows.push(row);
    }

    const total = rows.length;

    for (let i = 0; i < total; i++) {
        const row = rows[i];
        // Zod Validation
        const validation = RowSchema.safeParse(row);
        if (!validation.success) {
            const errorMsg = validation.error.issues.map(e => e.message).join(", ");
            failedRows.push({ id: row.id || 'N/A', reason: `Validation: ${errorMsg}`, originalRow: row });
        } else {
            // Database Insertion & Error Handling
            try {
                const v = validation.data;
                await db.insert(comments).values({
                    postId: v.postId,
                    comment_id: v.id,
                    name: v.name,
                    email: v.email,
                    body: v.body,
                });
                successCount++;
            } catch (err: any) {
                let reason = "Unknown Error";
                const errorCode = err.cause?.code || err.driverError?.code;
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
                failedRows.push({ id: parseInt(row.id) || 'N/A', reason, originalRow: row });
            }
        }

        if (jobId && (i % 10 === 0 || i === total - 1)) {
            setProgress(jobId, Math.round(((i + 1) / Math.max(1, total)) * 100));
        }
    }
  await db.update(metadata)
    .set({ value: sql`${metadata.value} + ${successCount}` })
    .where(eq(metadata.key, 'total_comments'));

  return {
    success: successCount,
    failed: failedRows.length,
    failures: failedRows
  };
};

export const fetchPaginatedComment = async (
    page: number, 
    limit: number,
    searchQuery?: string, 
    searchColumns: string[] = []
) => {
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(100, Math.max(1, limit || 10));
    const offset = (safePage - 1) * safeLimit;

    // Clean and Truncate Query
    const cleanQuery = searchQuery?.trim().slice(0, 100) || undefined; // truncate to prevent large search string that can slow server down
    const escapedQuery = cleanQuery ? escapeLike(cleanQuery) : undefined;

    let whereClause = undefined;
    const searchMap: Record<string, any> = {
        name: comments.name,
        email: comments.email,
        body: comments.body,
        };
    if (escapedQuery && searchColumns.length > 0) {
        const filters = searchColumns
            .filter(col => col in searchMap) // only filter by columns that are "safe"
            .map(col => ilike(searchMap[col], `%${escapedQuery}%`)); //ilike is parameterized query, safe from injection

        if (filters.length > 0) {
            whereClause = or(...(filters as any));
        }
    }
    const data = await db.select()
        .from(comments)
        .where(whereClause)
        .orderBy(comments.id)
        .limit(safeLimit)
        .offset(offset);

    const dataWithRowNumbers = data.map((item, index) => ({
        ...item,
        rowNumber: offset + index + 1
    }));
    let totalCount: number;

    if (whereClause) { // if it's filtered, the matched result wouldnt be the total count that is cached
        const result = await db.select({ count: count() })
            .from(comments)
            .where(whereClause);
        totalCount = Number(result[0].count);
    }else{
        const statsResult = await db.select({ value: metadata.value })
                .from(metadata)
                .where(eq(metadata.key, 'total_comments'))
                .limit(1);

        totalCount = statsResult[0]?.value ?? 0;
    }
    
    return {
        data: dataWithRowNumbers,
        meta: {
            totalCount: totalCount,
            itemCount: data.length,
            totalPages: Math.ceil(totalCount / safeLimit),
            currentPage: safePage,
            limit: safeLimit
        }   
  };
};



export const wipeDatabase = async () => {
    await db.delete(comments);
    await db.update(metadata)
    .set({ value: 0 })
    .where(eq(metadata.key, 'total_comments'));
};