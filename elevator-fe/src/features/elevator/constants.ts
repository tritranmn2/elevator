export const ELEVATOR_CONSTANTS = {
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

