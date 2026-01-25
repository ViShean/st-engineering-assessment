import { describe, it, expect } from '@jest/globals';

import * as paginationUtils from '../../utils/pagination.js';

describe('calculatePagination Utility', () => {
const paginationScenarios = [
        // --- Standard Scenarios ---
        {
            description: "standard first page with 10 items",
            input: { page: 1, limit: 10, totalCount: 100 },
            expected: { safePage: 1, safeLimit: 10, offset: 0, totalPages: 10 }
        },
        {
            description: "standard second page",
            input: { page: 2, limit: 10, totalCount: 100 },
            expected: { safePage: 2, safeLimit: 10, offset: 10, totalPages: 10 }
        },
        {
            description: "last page with partial items",
            input: { page: 10, limit: 11, totalCount: 100 },
            expected: { safePage: 10, safeLimit: 11, offset: 99, totalPages: 10 }
        },

        // --- Page Edge Cases ---
        {
            description: "zero page (should default to 1)",
            input: { page: 0, limit: 10, totalCount: 100 },
            expected: { safePage: 1, offset: 0 }
        },
        {
            description: "negative page (should default to 1)",
            input: { page: -5, limit: 10, totalCount: 100 },
            expected: { safePage: 1, offset: 0 }
        },
        {
            description: "non-finite page (NaN) (should default to 1)",
            input: { page: NaN, limit: 10, totalCount: 100 },
            expected: { safePage: 1, offset: 0 }
        },

        // --- Limit Edge Cases ---
        {
            description: "zero limit (should default to 10)",
            input: { page: 1, limit: 0, totalCount: 100 },
            expected: { safeLimit: 10, totalPages: 10 }
        },
        {
            description: "negative limit (should default to 1)",
            input: { page: 1, limit: -10, totalCount: 100 },
            expected: { safeLimit: 1, totalPages: 100 }
        },
        {
            description: "limit exceeding maximum (should cap at 100)",
            input: { page: 1, limit: 500, totalCount: 1000 },
            expected: { safeLimit: 100, totalPages: 10 }
        },

        // --- Total Count / Math Scenarios ---
        {
            description: "zero total count (empty database)",
            input: { page: 1, limit: 10, totalCount: 0 },
            expected: { totalPages: 0, offset: 0 }
        },
        {
            description: "total count results in exactly one page",
            input: { page: 1, limit: 20, totalCount: 20 },
            expected: { totalPages: 1 }
        },
        {
            description: "large total count math",
            input: { page: 5, limit: 20, totalCount: 1000 },
            expected: { safePage: 5, safeLimit: 20, offset: 80, totalPages: 50 }
        }
    ];
    it.each(paginationScenarios)(
        'should handle $description', 
        ({ input, expected }) => {
            const result = paginationUtils.calculatePagination(input.page, input.limit, input.totalCount);
            
            // Check only the properties provided in 'expected' to keep test data clean
            if (expected.safePage !== undefined) expect(result.safePage).toBe(expected.safePage);
            if (expected.safeLimit !== undefined) expect(result.safeLimit).toBe(expected.safeLimit);
            if (expected.offset !== undefined) expect(result.offset).toBe(expected.offset);
            if (expected.totalPages !== undefined) expect(result.totalPages).toBe(expected.totalPages);
        }
    );
})