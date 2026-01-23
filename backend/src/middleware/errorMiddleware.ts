import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal Error:", err.stack);

  const status = err.message.includes('Missing columns') ? 400 : 500;

  res.status(status).json({ 
    error: err.message || "An unexpected server error occurred" 
  });
};