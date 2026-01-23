import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService.js';
import fs from 'fs';

export const handleUpload = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const filePath = req.file.path;
    try {
        const results = await commentService.processCsvUpload(req.file.path);
        res.json({ message: "Upload processed", results });
    } catch (error) {
        next(error); // Passes to global error handler
    } finally {
        if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        }
    }
};

// TESTING ONLY
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await commentService.fetchLatestComments();
        res.json(data);
    } catch (error) { next(error); }
};

export const resetDatabase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await commentService.wipeDatabase();
        res.json({ message: "Database wiped." });
    } catch (error) { next(error); }
};