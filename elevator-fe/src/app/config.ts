export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3001',
} as const;
