import {z} from 'zod'

export const RowSchema = z.object({
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

export const validateCsvHeaders = (headers: string[]) => {
    const requiredHeaders = ['postid', 'id', 'name', 'email', 'body'];

    // Clean headers to handle potential invisible spaces from CSV generation
    const cleanActualHeaders = headers.map(h => h.trim().toLowerCase());
    const missing = requiredHeaders.filter(
        (required) => !cleanActualHeaders.includes(required)
    );

    return {
        isValid: missing.length === 0,
        missing: missing
    };
};

