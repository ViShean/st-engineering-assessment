import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import type { Mock } from 'jest-mock';

// Mock functions defined at module scope
const mockValues: Mock<() => Promise<unknown>> = jest.fn();
const mockUpdateWhere: Mock<() => Promise<unknown>> = jest.fn();

// Separate mock functions for different query paths
const mockCountResult = jest.fn() as Mock<any>;  // For count() queries (search path)
const mockMetadataResult = jest.fn() as Mock<any>; // For metadata queries  
const mockDataResult = jest.fn() as Mock<any>;  // For data queries

// This will hold the async iterable that gets returned from pipe()
let mockAsyncIterable: AsyncIterable<unknown>;

// ESM mocks must be defined before importing the module under test
jest.unstable_mockModule('../../db/index.js', () => ({
    db: {
        insert: jest.fn(() => ({ values: mockValues })),
        update: jest.fn(() => ({ set: jest.fn(() => ({ where: mockUpdateWhere })) })),
        delete: jest.fn(),
        select: jest.fn((selectArg) => {
            // Detect if this is a count() query by checking if selectArg has 'count' key
            const isCountQuery = selectArg && typeof selectArg === 'object' && 'count' in selectArg;
            const isValueQuery = selectArg && typeof selectArg === 'object' && 'value' in selectArg;
            
            return {
                from: jest.fn(() => ({
                    // For count queries (search), .where() returns the result directly
                    where: jest.fn(() => {
                        if (isCountQuery) {
                            // count() query - returns directly from where()
                            return mockCountResult();
                        }
                        // For metadata query or data query with where clause
                        return {
                            limit: isValueQuery ? mockMetadataResult : jest.fn(), // metadata query ends with .limit(1)
                            orderBy: jest.fn(() => ({
                                limit: jest.fn(() => ({
                                    offset: mockDataResult, // data query
                                })),
                            })),
                        };
                    }),
                    // For data queries without where clause
                    orderBy: jest.fn(() => ({
                        limit: jest.fn(() => ({
                            offset: mockDataResult,
                        })),
                    })),
                    limit: mockMetadataResult,
                })),
            };
        }),
    },
}));

jest.unstable_mockModule('../../db/schema.js', () => ({
    comments: { name: 'comments' },
    metadata: { key: 'key', value: 'value' },
}));

jest.unstable_mockModule('../../services/progressStore.js', () => ({
    setProgress: jest.fn(),
    clearProgressLater: jest.fn(),
}));

jest.unstable_mockModule('fs', () => ({
    default: {
        createReadStream: jest.fn(() => ({
            pipe: jest.fn(() => mockAsyncIterable),
        })),
    },
    createReadStream: jest.fn(() => ({
        pipe: jest.fn(() => mockAsyncIterable),
    })),
}));

jest.unstable_mockModule('csv-parse', () => ({
    parse: jest.fn(),
}));

// Dynamic import AFTER mocks are set up
const { processCsvUpload, fetchPaginatedComment } = await import('../../services/dataService.js');

describe('processCsvUpload', () => {
    // Data Factory - Note: Zod schema expects 'postId' (camelCase)
    const createRow = (overrides: Record<string, string | number> = {}) => ({
        postId: '1',
        id: '101',
        name: 'John Doe',
        email: 'john@example.com',
        body: 'Test comment body',
        ...overrides,
    });

    // Helper to create async iterable from rows
    const mockStream = (rows: any[]) => {
        mockAsyncIterable = {
            [Symbol.asyncIterator]: async function* () {
                for (const row of rows) {
                    yield row;
                }
            }
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateWhere.mockResolvedValue({});
    });

    describe('Success Scenarios', () => {
        const validScenarios = [
            { desc: 'standard valid row', data: [createRow()] },
            { desc: 'unicode characters', data: [createRow({ name: 'Lím Vi Shéan 李明', body: 'Hello 😊 世界' })] },
            { desc: 'numeric string ids', data: [createRow({ postId: '999', id: '12345' })] },
            { desc: 'long body text', data: [createRow({ body: 'A'.repeat(1000) })] },
            { desc: 'email with subdomain', data: [createRow({ email: 'test@mail.example.com' })] },
        ];

        it.each(validScenarios)('should successfully process: $desc', async ({ data }) => {
            mockStream(data);
            mockValues.mockResolvedValue({});

            const result = await processCsvUpload('fake.csv');

            expect(result.success).toBe(data.length);
            expect(result.failed).toBe(0);
            expect(result.failures).toHaveLength(0);
        });

        it('should process multiple valid rows', async () => {
            const rows = [
                createRow({ id: '101' }),
                createRow({ id: '102', name: 'Jane' }),
                createRow({ id: '103', name: 'Bob' }),
            ];
            mockStream(rows);
            mockValues.mockResolvedValue({});

            const result = await processCsvUpload('fake.csv');

            expect(result.success).toBe(3);
            expect(result.failed).toBe(0);
        });
    });

    describe('Database Error Scenarios', () => {
        const dbErrorScenarios = [
            { desc: 'duplicate key (23505)', error: { cause: { code: '23505' } }, expectedReason: 'Duplicate ID (Already exists)' },
            { desc: 'null violation (23502)', error: { cause: { code: '23502' } }, expectedReason: 'Missing required field (Null violation)' },
            { desc: 'invalid data format (22P02)', error: { cause: { code: '22P02' } }, expectedReason: 'Invalid data format (Invalid integer or type)' },
            { desc: 'connection lost (08003)', error: { cause: { code: '08003' } }, expectedReason: 'Database connection lost' },
            { desc: 'connection lost (08006)', error: { cause: { code: '08006' } }, expectedReason: 'Database connection lost' },
            { desc: 'unknown error with message', error: { message: 'Custom DB error' }, expectedReason: 'Custom DB error' },
            { desc: 'unknown error without message', error: {}, expectedReason: 'Database execution failed' },
        ];

        it.each(dbErrorScenarios)('should handle: $desc', async ({ error, expectedReason }) => {
            mockStream([createRow()]);
            mockValues.mockRejectedValue(error);

            const result = await processCsvUpload('fake.csv');

            expect(result.success).toBe(0);
            expect(result.failed).toBe(1);
            expect(result.failures[0].reason).toBe(expectedReason);
        });
    });

    describe('Header Validation Scenarios', () => {
        const missingHeaderScenarios = [
            { desc: 'missing postid header', data: { id: '101', name: 'John', email: 'j@a.com', body: 'Body'} },
            { desc: 'missing id header', data: { postId: '1',  name: 'John', email: 'j@a.com', body: 'Body'} },

            { desc: 'missing body header', data: { postId: '1', id: '101', name: 'John', email: 'j@a.com' } },
            { desc: 'missing email header', data: { postId: '1', id: '101', name: 'John', body: 'Body' } },
            { desc: 'missing name header', data: { postId: '1', id: '101', email: 'j@a.com', body: 'Body' } },
        ];

        it.each(missingHeaderScenarios)('should throw error when $desc', async ({ data }) => {
            mockStream([data as unknown as Record<string, string | number>]);

            await expect(processCsvUpload('fake.csv')).rejects.toThrow('Invalid CSV structure');
        });
    });

    describe('Mixed Success/Failure Scenarios', () => {
        it('should track valid and invalid rows separately', async () => {
            const rows = [
                createRow({ id: '101' }),                    // Valid
                createRow({ id: '102', name: '' }),          // Invalid - empty name
                createRow({ id: '103' }),                    // Valid
                createRow({ id: '104', email: 'bad' }),      // Invalid - bad email
            ];
            mockStream(rows);
            mockValues.mockResolvedValue({});

            const result = await processCsvUpload('fake.csv');

            expect(result.success).toBe(2);
            expect(result.failed).toBe(2);
            expect(result.failures.map(f => f.id)).toEqual(['102', '104']);
            expect(result.failures[0].reason).toContain('Name is required');
            expect(result.failures[1].reason).toContain('Invalid email');
        });

        it('should handle mixed validation and database errors', async () => {
            const rows = [
                createRow({ id: '101' }),                    // Will succeed
                createRow({ id: '101' }),                    // Will fail - duplicate key (23505)
                createRow({ id: '103', name: '' }),          // Will fail - validation (empty name)
                createRow({ id: '104' }),                    // Will fail - null violation (23502)
                createRow({ id: '105' }),                    // Will succeed
                createRow({ id: 'abc' }),                    // Will fail - invalid format (22P02)
                createRow({ id: '107', email: 'bad' }),      // Will fail - validation (bad email)
            ];
            mockStream(rows);
            
            // Mock db responses: success, duplicate, (skip validation), null violation, success, invalid format, (skip validation)
            mockValues
                .mockResolvedValueOnce({})                                      // id 101 - success
                .mockRejectedValueOnce({ cause: { code: '23505' } })            // id 102 - duplicate key
                // id 103 skipped (validation fails before db)
                .mockRejectedValueOnce({ cause: { code: '23502' } })            // id 104 - null violation
                .mockResolvedValueOnce({})                                      // id 105 - success
                .mockRejectedValueOnce({ cause: { code: '22P02' } });           // id 106 - invalid format
                // id 107 skipped (validation fails before db)

            const result = await processCsvUpload('fake.csv');

            expect(result.success).toBe(2);
            expect(result.failed).toBe(5);
            
            // Check each failure reason
            const failureMap = Object.fromEntries(result.failures.map(f => [f.id, f.reason]));
            expect(failureMap['101']).toBe('Duplicate ID (Already exists)');
            expect(failureMap['103']).toContain('Name is required');
            expect(failureMap['104']).toBe('Missing required field (Null violation)');
            expect(failureMap['abc']).toBe('Validation: id must be a number');
            expect(failureMap['107']).toContain('Invalid email');
        });
    });


});
// -------------- Fetch Paginated Comment Section --------------
describe('fetchPaginatedComment', () => {
    const createComment = (overrides: Record<string, any> = {}) => ({
        id: 1,
        postId: 1,
        comment_id: 101,
        name: 'John Doe',
        email: 'john@example.com',
        body: 'Test comment body',
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Response Structure and Row Numbering', () => {
        it('should return correct response structure with meta and data', async () => {
            const mockDbData = [createComment(), createComment({ id: 2 })];
            mockMetadataResult.mockResolvedValueOnce([{ value: 100 }]);
            mockDataResult.mockResolvedValueOnce(mockDbData);

            const result = await fetchPaginatedComment(2, 10);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('meta');
            expect(result.meta).toEqual({
                totalCount: 100,
                itemCount: 2,
                totalPages: 10,
                currentPage: 2,
                limit: 10,
            });
        });

        it('should append rowNumber based on pagination offset', async () => {
            const mockDbData = [createComment({ id: 10 }), createComment({ id: 11 })];
            mockMetadataResult.mockResolvedValueOnce([{ value: 500 }]);
            mockDataResult.mockResolvedValueOnce(mockDbData);

            const result = await fetchPaginatedComment(3, 10); // offset = 20

            expect(result.data[0].rowNumber).toBe(21);
            expect(result.data[1].rowNumber).toBe(22);
        });

        it('should preserve all original comment fields', async () => {
            const originalComment = createComment({
                id: 42, postId: 7, comment_id: 999,
                name: 'Jane Doe', email: 'jane@test.com', body: 'Original body',
            });
            mockMetadataResult.mockResolvedValueOnce([{ value: 1 }]);
            mockDataResult.mockResolvedValueOnce([originalComment]);

            const result = await fetchPaginatedComment(1, 10);

            expect(result.data[0]).toMatchObject(originalComment);
            expect(result.data[0].rowNumber).toBe(1);
        });

        it('should handle empty result set', async () => {
            mockMetadataResult.mockResolvedValueOnce([{ value: 0 }]);
            mockDataResult.mockResolvedValueOnce([]);

            const result = await fetchPaginatedComment(1, 10);

            expect(result.data).toHaveLength(0);
            expect(result.meta.totalCount).toBe(0);
            expect(result.meta.itemCount).toBe(0);
        });
    });

    describe('Search Query Paths (Count vs Metadata)', () => {
        it('should use metadata for count when no search is performed', async () => {
            mockMetadataResult.mockResolvedValueOnce([{ value: 1000 }]);
            mockDataResult.mockResolvedValueOnce([createComment()]);

            const result = await fetchPaginatedComment(1, 10);

            expect(result.meta.totalCount).toBe(1000);
        });

        it('should use count query when valid search columns provided', async () => {
            mockCountResult.mockResolvedValueOnce([{ count: 5 }]);
            mockDataResult.mockResolvedValueOnce([createComment()]);

            const result = await fetchPaginatedComment(1, 10, 'search', ['name']);

            expect(result.meta.totalCount).toBe(5);
        });

        it('should fall back to metadata when search columns are empty', async () => {
            mockMetadataResult.mockResolvedValueOnce([{ value: 50 }]);
            mockDataResult.mockResolvedValueOnce([createComment()]);

            const result = await fetchPaginatedComment(1, 10, 'test', []);

            expect(result.meta.totalCount).toBe(50);
        });

        it('should fall back to metadata when searchQuery is undefined', async () => {
            mockMetadataResult.mockResolvedValueOnce([{ value: 50 }]);
            mockDataResult.mockResolvedValueOnce([createComment()]);

            const result = await fetchPaginatedComment(1, 10, undefined, ['name']);

            expect(result.meta.totalCount).toBe(50);
        });

        it('should handle missing metadata gracefully (default to 0)', async () => {
            mockMetadataResult.mockResolvedValueOnce([]);
            mockDataResult.mockResolvedValueOnce([]);

            const result = await fetchPaginatedComment(1, 10);

            expect(result.meta.totalCount).toBe(0);
        });
    });

    describe('Search and Filtering', () => {
        // Shared test dataset - 10 users with varied data for realistic filtering
        const testDataset = [
            createComment({ id: 1, name: 'John Smith', email: 'john@company.com', body: 'Hello world' }),
            createComment({ id: 2, name: 'Jane Doe', email: 'jane@company.com', body: 'Testing 123' }),
            createComment({ id: 3, name: 'Johnny Appleseed', email: 'johnny@example.org', body: 'Great post!' }),
            createComment({ id: 4, name: 'Alice Wong', email: 'alice@example.org', body: 'I agree with John' }),
            createComment({ id: 5, name: 'Bob Johnson', email: 'bob@test.net', body: 'Nice article' }),
            createComment({ id: 6, name: 'Big John', email: 'bigjohn@test.net', body: 'Interesting' }),
            createComment({ id: 7, name: 'Mary Jane', email: 'mj@company.com', body: 'Love this!' }),
            createComment({ id: 8, name: 'Peter Parker', email: 'peter@example.org', body: 'John mentioned this' }),
            createComment({ id: 9, name: 'Clark Kent', email: 'clark@daily.com', body: 'Good read' }),
            createComment({ id: 10, name: 'Bruce Wayne', email: 'bruce@wayne.com', body: 'Noted' }),
        ];

        describe('Filter by Name Column', () => {
            it('should return only rows where name contains "john" (4 hits)', async () => {
                // "John Smith", "Johnny Appleseed", "Big John" match
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('john')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'john', ['name']);

                expect(result.data).toHaveLength(4);
                expect(result.data.map(d => d.name)).toEqual([
                    'John Smith', 'Johnny Appleseed', 'Bob Johnson', 'Big John', 
                ]);
            });

            it('should return only rows where name contains "jane" (2 hits)', async () => {
                // "Jane Doe", "Mary Jane" match
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('jane')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'jane', ['name']);

                expect(result.data).toHaveLength(2);
                expect(result.data.map(d => d.name)).toEqual(['Jane Doe', 'Mary Jane']);
            });

            it('should return zero rows when no name matches', async () => {
                mockCountResult.mockResolvedValueOnce([{ count: 0 }]);
                mockDataResult.mockResolvedValueOnce([]);

                const result = await fetchPaginatedComment(1, 10, 'zzzznonexistent', ['name']);

                expect(result.data).toHaveLength(0);
                expect(result.meta.totalCount).toBe(0);
            });
        });

        describe('Filter by Email Column', () => {
            it('should return only rows with @company.com emails (3 hits)', async () => {
                const matchingRows = testDataset.filter(r =>
                    r.email.includes('@company.com')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, '@company.com', ['email']);

                expect(result.data).toHaveLength(3);
                expect(result.data.map(d => d.email)).toEqual([
                    'john@company.com', 'jane@company.com', 'mj@company.com'
                ]);
            });

            it('should return only rows with @example.org emails (3 hits)', async () => {
                const matchingRows = testDataset.filter(r =>
                    r.email.includes('@example.org')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, '@example.org', ['email']);

                expect(result.data).toHaveLength(3);
                expect(result.data.map(d => d.email)).toEqual([
                    'johnny@example.org', 'alice@example.org', 'peter@example.org'
                ]);
            });
        });

        describe('Filter by Body Column', () => {
            it('should return rows where body mentions "john" (2 hits)', async () => {
                // "I agree with John", "John mentioned this"
                const matchingRows = testDataset.filter(r =>
                    r.body.toLowerCase().includes('john')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'john', ['body']);

                expect(result.data).toHaveLength(2);
                expect(result.data.map(d => d.body)).toEqual([
                    'I agree with John', 'John mentioned this'
                ]);
            });
        });

        describe('Filter Across Multiple Columns', () => {
            it('should return rows where "john" appears in name OR body (6 unique hits)', async () => {
                // name: "John Smith", "Johnny Appleseed", "Big John"
                // body: "I agree with John", "John mentioned this"
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('john') ||
                    r.body.toLowerCase().includes('john')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'john', ['name', 'body']);

                expect(result.data).toHaveLength(6);
                const names = result.data.map(d => d.name);
                expect(names).toContain('John Smith');
                expect(names).toContain('Johnny Appleseed');
                expect(names).toContain('Big John');
                expect(names).toContain('Alice Wong');  // body mentions John
                expect(names).toContain('Peter Parker'); // body mentions John
            });

            it('should search all columns (name, email, body) simultaneously', async () => {
                // Search "example" - matches email column: johnny, alice, peter
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('example') ||
                    r.email.toLowerCase().includes('example') ||
                    r.body.toLowerCase().includes('example')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'example', ['name', 'email', 'body']);

                expect(result.data).toHaveLength(3);
                expect(result.data.map(d => d.name)).toEqual([
                    'Johnny Appleseed', 'Alice Wong', 'Peter Parker'
                ]);
            });
        });

        describe('Edge Cases', () => {
            it('should handle single character search', async () => {
                // Search "j" in name - matches John, Jane, Johnny, Big John, Mary Jane, Bob Johnson
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('j')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'j', ['name']);

                expect(result.data).toHaveLength(6);
            });

            it('should match partial words', async () => {
                // Search "app" in name - matches "Johnny Appleseed"
                const matchingRows = testDataset.filter(r =>
                    r.name.toLowerCase().includes('app')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'app', ['name']);

                expect(result.data).toHaveLength(1);
                expect(result.data[0].name).toBe('Johnny Appleseed');
            });

            it('should return single unique match when same query matches different columns', async () => {
                // "bigjohn" appears only in email for Big John
                const matchingRows = testDataset.filter(r =>
                    r.email.includes('bigjohn')
                );
                mockCountResult.mockResolvedValueOnce([{ count: matchingRows.length }]);
                mockDataResult.mockResolvedValueOnce(matchingRows);

                const result = await fetchPaginatedComment(1, 10, 'bigjohn', ['name', 'email']);

                expect(result.data).toHaveLength(1);
                expect(result.data[0].name).toBe('Big John');
            });
        });
    });

    describe('Column Whitelist Security', () => {


        const unsafeColumnScenarios = [
            { desc: 'SQL injection attempt', cols: ['name; DROP TABLE comments;--'] },
            { desc: 'non-whitelisted column', cols: ['password_hash'] },
            { desc: 'id column', cols: ['id'] },
            { desc: 'postId column', cols: ['postId'] },
        ];

        it.each(unsafeColumnScenarios)(
            'should ignore unsafe columns and use metadata: $desc',
            async ({ cols }) => {
                mockMetadataResult.mockResolvedValueOnce([{ value: 50 }]);
                mockDataResult.mockResolvedValueOnce([]);

                const result = await fetchPaginatedComment(1, 10, 'test', cols);
                // count using metadata means the search has not been trigerred
                expect(result.meta.totalCount).toBe(50); // Uses metadata, not count
            }
        );

        it('should use only whitelisted columns from mixed array', async () => {
            // 'name' is whitelisted, 'password' and 'admin' are not
            mockCountResult.mockResolvedValueOnce([{ count: 5 }]);
            mockDataResult.mockResolvedValueOnce([createComment()]);

            const result = await fetchPaginatedComment(1, 10, 'test', ['name', 'password', 'admin']);

            expect(result.meta.totalCount).toBe(5); // Uses count query (valid column exists)
        });

        const validColumnScenarios = [
            { desc: 'name column', cols: ['name'] },
            { desc: 'email column', cols: ['email'] },
            { desc: 'body column', cols: ['body'] },
            { desc: 'all valid columns', cols: ['name', 'email', 'body'] },
        ];

        it.each(validColumnScenarios)(
            'should accept whitelisted columns: $desc',
            async ({ cols }) => {
                mockCountResult.mockResolvedValueOnce([{ count: 3 }]);
                mockDataResult.mockResolvedValueOnce([createComment()]);

                const result = await fetchPaginatedComment(1, 10, 'test', cols);

                expect(result.meta.totalCount).toBe(3);
            }
        );
    });

});
