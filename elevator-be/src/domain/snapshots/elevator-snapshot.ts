import { Direction } from '../enums/direction.enum';
import { ElevatorState } from '../enums/elevator-state.enum';
import { DoorState } from '../enums/door-state.enum';

export interface ElevatorSnapshot {
  id: number;
  currentFloor: number;
  direction: Direction;
  state: ElevatorState;
  doorState: DoorState;
  destinationRequests: number[];
  hallRequests: { floor: number; direction: Direction }[];
}

export interface SystemSnapshot {
  timestamp: number;
  elevators: ElevatorSnapshot[];
}
