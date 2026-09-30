export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3001',
  TOTAL_FLOORS: 10,
  TOTAL_ELEVATORS: 3,
  MIN_FLOOR: 1,
  MAX_FLOOR: 10,
  FLOOR_HEIGHT_PX: 60,
  ELEVATOR_IDS: [1, 2, 3] as const,
} as const;
