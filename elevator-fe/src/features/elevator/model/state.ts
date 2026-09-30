import type { ElevatorSnapshot, SystemLogEntry } from './types';

export interface ElevatorFeatureState {
  elevators: Record<number, ElevatorSnapshot>;
  connected: boolean;
  lastUpdated: number;
  logs: SystemLogEntry[];
  selectedElevatorId: number;
  activeHallCalls: Record<string, boolean>; // key: `${floor}_${direction}`, value: true
  isLoading: boolean;
  error: string | null;
}

export const createDefaultElevatorSnapshot = (id: number): ElevatorSnapshot => ({
  id,
  currentFloor: 1,
  direction: 'IDLE',
  state: 'IDLE',
  doorState: 'CLOSED',
  destinationRequests: [],
  hallRequests: [],
});

export const initialElevatorState: ElevatorFeatureState = {
  elevators: {
    1: createDefaultElevatorSnapshot(1),
    2: createDefaultElevatorSnapshot(2),
    3: createDefaultElevatorSnapshot(3),
  },
  connected: false,
  lastUpdated: Date.now(),
  logs: [
    {
      id: 'init-1',
      timestamp: Date.now(),
      type: 'INFO',
      message: 'Elevator Simulation System initialized. Waiting for backend connection...',
    },
  ],
  selectedElevatorId: 1,
  activeHallCalls: {},
  isLoading: false,
  error: null,
};
