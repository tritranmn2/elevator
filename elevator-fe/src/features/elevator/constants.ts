export const ELEVATOR_CONSTANTS = {
  MIN_FLOOR: 1,
  MAX_FLOOR: 10,
  TOTAL_FLOORS: 10,
  TOTAL_ELEVATORS: 3,
  ELEVATOR_IDS: [1, 2, 3],
  FLOOR_LIST: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], // Top to bottom display order
  API_ROUTES: {
    ELEVATORS: '/api/elevators',
    CALL: '/api/elevators/call',
    DESTINATION: (id: number) => `/api/elevators/${id}/destination`,
    DOOR_OPEN: (id: number) => `/api/elevators/${id}/door/open`,
    DOOR_CLOSE: (id: number) => `/api/elevators/${id}/door/close`,
  },
  WS_EVENTS: {
    SIMULATION_SNAPSHOT: 'simulation:snapshot',
    SIMULATION_TICK: 'simulation:tick',
    ELEVATOR_ARRIVED: 'elevator:arrived',
    DOOR_STATE_CHANGED: 'elevator:door_state_changed',
  },
} as const;
