import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // console.error("Internal Error:", err.stack);

  const isMissingColumns = err?.message?.includes('Missing columns');
  const status = isMissingColumns ? 400 : 500;
  res.status(status).json({ 
    error: err.message || "An unexpected server error occurred" 
  });
};