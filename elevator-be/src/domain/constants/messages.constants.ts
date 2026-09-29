export const SYSTEM_MESSAGES = {
  ERROR: {
    FLOOR_RANGE: (min: number, max: number) => `Floor must be between ${min} and ${max}`,
    CANNOT_CALL_UP_HIGHEST: 'Cannot call UP on the highest floor',
    CANNOT_CALL_DOWN_LOWEST: 'Cannot call DOWN on the lowest floor',
    ELEVATOR_NOT_FOUND: (id: number) => `Elevator with ID ${id} not found`,
    NO_ELEVATORS_AVAILABLE: 'No elevators available to select',
    VALIDATION_FLOOR_INTEGER: 'Floor must be an integer',
    VALIDATION_FLOOR_MIN: (min: number) => `Floor cannot be less than ${min}`,
    VALIDATION_FLOOR_MAX: (max: number) => `Floor cannot be greater than ${max}`,
    VALIDATION_DIRECTION_ENUM: 'Direction must be UP or DOWN',
  },
  SUCCESS: {
    HALL_CALL_ASSIGNED: (elevatorId: number) => `Hall call assigned to Elevator ${elevatorId}`,
    DESTINATION_SELECTED: (floor: number, elevatorId: number) =>
      `Destination floor ${floor} selected for Elevator ${elevatorId}`,
    DOOR_OPEN_ACCEPTED: (elevatorId: number) => `Door open command accepted for Elevator ${elevatorId}`,
    DOOR_OPEN_CANNOT_WHILE_MOVING: 'Cannot open door while elevator is moving',
    DOOR_CLOSE_ACCEPTED: (elevatorId: number) => `Door close command accepted for Elevator ${elevatorId}`,
    DOOR_CLOSE_NOT_OPEN: 'Door is not in OPEN state',
  },
  LOG: {
    WS_INITIALIZED: 'Elevator WebSocket Gateway initialized (Realtime Broadcaster)',
    WS_CONNECTED: (id: string) => `Client connected: ${id}`,
    WS_DISCONNECTED: (id: string) => `Client disconnected: ${id}`,
    SIMULATION_START: (intervalMs: number) => `Starting Simulation Engine with tick rate: ${intervalMs}ms`,
    SIMULATION_STOP: 'Simulation Engine stopped.',
    SIMULATION_LISTENER_ERROR: 'Error in simulation listener',
    SERVER_RUNNING: (port: number | string) => `Elevator Simulator Backend is running on: http://localhost:${port}`,
    SWAGGER_AVAILABLE: (port: number | string) => `Swagger Interactive API Docs available at: http://localhost:${port}/docs`,
  },
} as const;
