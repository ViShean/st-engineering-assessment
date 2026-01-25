import { describe, it, expect } from '@jest/globals';

import * as schemaValidation from '../../utils/schemaValidation.js';

// --------- Row Schema Validaiton(Parsing) ---------
describe('Row Validation Schema', () => {
    const createRow = (overrides = {}) => ({
            postId: "1",
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            body: "Default valid body",
            ...overrides
        });
    describe('Valid Scenarios', () =>{
        const validScenarios = [
            {
                description: "standard string numeric values",
                input: createRow({ postId: "10", id: "500" }),
                expected: { postId: 10, id: 500 }
            },
            {
                description: "direct integer values",
                input: createRow({ postId: 10, id: 500 }),
                expected: { postId: 10, id: 500 }
            },
            {
                description: "special characters in name and body",
                input: createRow({ 
                    name: "Lím Vi Shéan", 
                    body: "Unicode test: 😊! @#$%^&*()" 
                }),
                expected: { name: "Lím Vi Shéan", body: "Unicode test: 😊! @#$%^&*()" }
            },
            {
                description: "complex valid email formats",
                input: createRow({ email: "dev.testing+label@sub.sit.edu.sg" }),
                expected: { email: "dev.testing+label@sub.sit.edu.sg" }
            },
            {
                description: "very long body text",
                input: createRow({ body: "A".repeat(1000) }),
                expected: { body: "A".repeat(1000) }
            }
        ];

        it.each(validScenarios)(
            'should pass for $description', 
            ({ input, expected }) => {
            const result = schemaValidation.RowSchema.safeParse(input);
            
            expect(result.success).toBe(true);
            
            if (result.success) {
                // Verify specific data transformations (Coercion)
                if (expected.postId) expect(result.data.postId).toBe(expected.postId);
                if (expected.id) expect(result.data.id).toBe(expected.id);
                if (expected.name) expect(result.data.name).toBe(expected.name);
                if (expected.email) expect(result.data.email).toBe(expected.email);
                
                // Ensure numbers are actually numbers (Type Safety)
                expect(typeof result.data.postId).toBe('number');
                expect(typeof result.data.id).toBe('number');
            }
            }
        );
    });

    describe('Invalid Scenarios', () =>{
        
        const invalidScenarios = [
            // --- PostID / ID Failures ---
            {
                description: "empty string postId",
                input: createRow({ postId: "" }),
                expectedError: "postId must be a number"
            },
            {
                description: "non-numeric postId",
                input: createRow({ postId: "not-a-number" }),
                expectedError: "postId must be a number"
            },
            {
                description: "empty string id",
                input: createRow({ id: "" }),
                expectedError: "id must be a number"
            },
            {
                description: "non-numeric id",
                input: createRow({ id: "not-a-number" }),
                expectedError: "id must be a number"
            },
            // --- Name Failures ---
            {
                description: "empty name",
                input: createRow({ name: "" }),
                expectedError: "Name is required"
            },
            // --- Email Failures ---
            {
                description: "invalid email format",
                input: createRow({ email: "invalid-email" }),
                expectedError: "Invalid email format"
            },
            {
                description: "missing email domain",
                input: createRow({ email: "test@site" }), // if Zod's .email() is strict
                expectedError: "Invalid email format"
            },
            // --- Body Failures ---
            {
                description: "empty body",
                input: createRow({ body: "" }),
                expectedError: "Body cannot be empty"
            }
        ];

        it.each(invalidScenarios)(
            'should reject $description', 
            ({ input, expectedError }) => {
            const result = schemaValidation.RowSchema.safeParse(input);
            
            // 1. Must fail
            expect(result.success).toBe(false);
            
            // 2. Must contain the correct error message
            if (!result.success) {
                const messages = result.error.issues.map(i => i.message);
                expect(messages).toContain(expectedError);
            }
            }
        );
    });
})


// --- Validating if required headers are there
describe('validateCsvHeaders Utility', () => {
  
  const headerScenarios = [
    // valid cases
    {
      description: "all required headers in correct order",
      input: ['postId', 'id', 'name', 'email', 'body'],
      expected: { isValid: true, missing: [] }
    },
    {
      description: "headers in different order",
      input: ['body', 'email', 'name', 'id', 'postId'],
      expected: { isValid: true, missing: [] }
    },
    {
      description: "headers with extra invisible whitespace",
      input: [' postId ', 'id', ' name', 'email', 'body '],
      expected: { isValid: true, missing: [] }
    },
    {
      description: "extra headers present",
      input: ['postId', 'id', 'name', 'email', 'body', 'metadata', 'timestamp'],
      expected: { isValid: true, missing: [] }
    },
    {
      description: "Mixed case and messy whitespace",
      input: [' Postid ', ' iD', 'Name', ' email ', ' BODY '],
      expected: { isValid: true, missing: [] }
    },
    {
      description: "all caps",
      input: ['postid', 'ID', 'NAME', 'EMAIL', 'BODY'],
      expected: { isValid: true, missing: [] }
    },
    // invalid cases
    {
      description: "missing a single required header (email)",
      input: ['postId', 'id', 'name', 'body'],
      expected: { isValid: false, missing: ['email'] }
    },
    {
      description: "missing multiple required headers",
      input: ['name', 'body'],
      expected: { isValid: false, missing: ['postid', 'id', 'email'] }
    },
    {
      description: "completely empty array",
      input: [],
      expected: { isValid: false, missing: ['postid', 'id', 'name', 'email', 'body'] }
    }
  ];

  it.each(headerScenarios)(
    'should handle $description', 
    ({ input, expected }) => {
      const result = schemaValidation.validateCsvHeaders(input);
      
      expect(result.isValid).toBe(expected.isValid);
      expect(result.missing).toEqual(expected.missing);
    }
  );
});