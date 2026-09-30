export const WS_EVENTS = {
  SIMULATION_SNAPSHOT: 'simulation:snapshot',
  SIMULATION_TICK: 'simulation:tick',
  ELEVATOR_ARRIVED: 'elevator:arrived',
  DOOR_STATE_CHANGED: 'elevator:door_state_changed',
  PING: 'ping',
  PONG: 'pong',
} as const;

export type WsEventType = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
