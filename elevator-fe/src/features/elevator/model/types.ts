export type Direction = 'UP' | 'DOWN' | 'IDLE';

export type DoorState = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING';

export type ElevatorState =
  | 'IDLE'
  | 'MOVING_UP'
  | 'MOVING_DOWN'
  | 'DOOR_OPENING'
  | 'DOOR_OPEN'
  | 'DOOR_CLOSING';

export interface HallRequest {
  floor: number;
  direction: Direction;
}

export interface ElevatorSnapshot {
  id: number;
  currentFloor: number;
  direction: Direction;
  state: ElevatorState;
  doorState: DoorState;
  destinationRequests: number[];
  hallRequests: HallRequest[];
}

export interface SystemSnapshot {
  timestamp: number;
  elevators: ElevatorSnapshot[];
}

export type ElevatorEventType =
  | 'ELEVATOR_MOVED'
  | 'ELEVATOR_ARRIVED'
  | 'DOOR_STATE_CHANGED'
  | 'ELEVATOR_STATE_CHANGED'
  | 'REQUEST_COMPLETED';

export interface BaseElevatorEvent {
  type: ElevatorEventType;
  elevatorId: number;
  timestamp: number;
}

export interface ElevatorMovedEvent extends BaseElevatorEvent {
  type: 'ELEVATOR_MOVED';
  fromFloor: number;
  toFloor: number;
  direction: Direction;
}

export interface ElevatorArrivedEvent extends BaseElevatorEvent {
  type: 'ELEVATOR_ARRIVED';
  floor: number;
  direction: Direction;
}

export interface DoorStateChangedEvent extends BaseElevatorEvent {
  type: 'DOOR_STATE_CHANGED';
  doorState: DoorState;
  floor: number;
}

export interface ElevatorStateChangedEvent extends BaseElevatorEvent {
  type: 'ELEVATOR_STATE_CHANGED';
  oldState: ElevatorState;
  newState: ElevatorState;
  direction: Direction;
  floor: number;
}

export interface RequestCompletedEvent extends BaseElevatorEvent {
  type: 'REQUEST_COMPLETED';
  floor: number;
  direction: Direction;
}

export type ElevatorEvent =
  | ElevatorMovedEvent
  | ElevatorArrivedEvent
  | DoorStateChangedEvent
  | ElevatorStateChangedEvent
  | RequestCompletedEvent;

export interface SimulationTickPayload {
  snapshot: SystemSnapshot;
  events: ElevatorEvent[];
}

export interface SystemLogEntry {
  id: string;
  timestamp: number;
  elevatorId?: number;
  type: 'INFO' | 'ACTION' | 'EVENT' | 'ERROR';
  message: string;
}
