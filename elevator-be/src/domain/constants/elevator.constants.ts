export const ELEVATOR_CONSTANTS = {
  NUM_FLOORS: 10,
  MIN_FLOOR: 1,
  MAX_FLOOR: 10,
  NUM_ELEVATORS: 3,
  DEFAULT_DOOR_DWELL_TICKS: 3, // 3 seconds dwell time when open
  SIMULATION_TICK_MS: 1000,    // 1 second per tick
} as const;
