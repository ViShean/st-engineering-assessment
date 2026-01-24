// API configuration
// In development: uses localhost:3001
// In Docker: set VITE_API_URL environment variable to point to the backend service

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// For SSE connections (without /api suffix)
export const API_HOST = API_BASE_URL.replace(/\/api$/, "");
