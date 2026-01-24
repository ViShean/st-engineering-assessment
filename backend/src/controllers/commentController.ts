import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { getProgress, clearProgressLater } from '../services/progressStore.js';

export const handleUpload = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const filePath = req.file.path;
    const jobId = (req.query.jobId as string) || undefined;
    try {
        const results = await commentService.processCsvUpload(req.file.path, jobId);
        res.json({ message: "Upload processed", results });
    } catch (error) {
        next(error); // Passes to global error handler
    } finally {
        if (jobId) {
            // Mark complete and clear later (in case SSE still connected)
            clearProgressLater(jobId, 5000);
        }
        if (fs.existsSync(filePath)) {
            await fsPromises.unlink(req.file.path);     
        }   
    }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const searchQuery = req.query.q as string;
        const columns = (req.query.columns as string || "").split(',').filter(Boolean);
        if (page < 1 || limit < 1) {
            return res.status(400).json({ error: "Page and limit must be positive integers." });
        }
        const result = await commentService.fetchPaginatedComment(page, limit, searchQuery, columns);        
        res.json(result);
    } catch (error) { next(error); }
};


// TESTING ONLY
export const resetDatabase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await commentService.wipeDatabase();
        res.json({ message: "Database wiped." });
    } catch (error) { next(error); }
};

// Server-Sent Events for real-time upload progress
export const streamProgress = (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const jobId = req.params.jobId as string;
    // Immediately send a ping to open the stream
    res.write(':ok\n\n');

    const interval = setInterval(() => {
        const progress = getProgress(jobId);
        res.write(`data: ${JSON.stringify({ progress })}\n\n`);
        if (progress >= 100) {
            clearInterval(interval);
            res.end();
        }
    }, 300);

    req.on('close', () => {
        clearInterval(interval);
    });
};