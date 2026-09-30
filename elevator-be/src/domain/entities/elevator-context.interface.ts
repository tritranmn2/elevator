import { Direction } from '../enums/direction.enum';
import { ElevatorState } from '../enums/elevator-state.enum';
import { DoorState } from '../enums/door-state.enum';

export interface IElevatorContext {
  getId(): number;
  getCurrentFloor(): number;
  getDirection(): Direction;
  getState(): ElevatorState;
  getDoorState(): DoorState;
  isMovingUp(): boolean;
  isMovingDown(): boolean;
  isIdle(): boolean;
}
