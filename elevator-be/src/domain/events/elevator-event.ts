import { Direction } from '../enums/direction.enum';
import { DoorState } from '../enums/door-state.enum';
import { ElevatorState } from '../enums/elevator-state.enum';

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
