import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { errorHandler } from '../../middleware/errorMiddleware.js';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: any; // Using any to allow fluent chaining mocks
    let mockNext: NextFunction;

    beforeEach(() => {
        // Clear all previous call data
        jest.clearAllMocks();
        
        mockRequest = {};
        mockNext = jest.fn();
        
        // Re-create the mock object entirely to avoid state pollution
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    const errorScenarios = [
        {
            description: "CSV Validation Error",
            error: new Error("Missing columns: postId"),
            expectedStatus: 400,
            expectedBody: { error: "Missing columns: postId" }
        },
        {
            description: "Generic Server Error",
            error: new Error("DB Connection Failed"),
            expectedStatus: 500,
            expectedBody: { error: "DB Connection Failed" }
        },
        {
            description: "Error with no message",
            error: {}, // This tests your defensive ?. check
            expectedStatus: 500,
            expectedBody: { error: "An unexpected server error occurred" }
        }
    ];

    it.each(errorScenarios)(
        'should return $expectedStatus for $description',
        ({ error, expectedStatus, expectedBody }) => {
            errorHandler(error as any, mockRequest as Request, mockResponse as Response, mockNext);

            // Now it will only have 1 call because we reset in beforeEach
            expect(mockResponse.status).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).toHaveBeenCalledWith(expectedStatus);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedBody);
        }
    );
});