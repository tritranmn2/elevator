import { Direction } from '../enums/direction.enum';
import { ElevatorRequest } from './elevator-request';

export abstract class HallRequest extends ElevatorRequest {
  protected readonly direction: Direction;

  constructor(targetFloor: number, direction: Direction) {
    super(targetFloor);
    this.direction = direction;
  }

  public getDirection(): Direction {
    return this.direction;
  }
}
