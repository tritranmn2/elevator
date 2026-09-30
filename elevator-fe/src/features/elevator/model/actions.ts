import type {
  Direction,
  DoorStateChangedEvent,
  ElevatorArrivedEvent,
  SimulationTickPayload,
  SystemLogEntry,
  SystemSnapshot,
} from './types';

export type ElevatorAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SYNC_SNAPSHOT'; payload: SystemSnapshot }
  | { type: 'HANDLE_TICK'; payload: SimulationTickPayload }
  | { type: 'ELEVATOR_ARRIVED'; payload: ElevatorArrivedEvent }
  | { type: 'DOOR_STATE_CHANGED'; payload: DoorStateChangedEvent }
  | { type: 'SET_SELECTED_ELEVATOR'; payload: number }
  | { type: 'ADD_LOG'; payload: Omit<SystemLogEntry, 'id'> }
  | { type: 'SET_HALL_CALL_ACTIVE'; payload: { floor: number; direction: Direction; active: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };
