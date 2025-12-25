// API Base URL - uses environment variable in production, localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

// Firebase project URL for hosting
export const FIREBASE_HOSTING_URL = 'https://derm-ai-d5e13.web.app';
