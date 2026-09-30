import { Direction } from '../enums/direction.enum';
import { RequestType } from '../enums/request-type.enum';
import { IElevatorContext } from '../entities/elevator-context.interface';
import { HallRequest } from './hall-request';

export class UpHallRequest extends HallRequest {
  constructor(targetFloor: number) {
    super(targetFloor, Direction.UP);
  }

  public getType(): RequestType {
    return RequestType.UP_HALL;
  }

  /**
   * Tính đa hình:
   * Thang máy phục vụ được yêu cầu UP nếu:
   * 1. Thang đang IDLE tại bất kỳ tầng nào.
   * 2. Hoặc thang đang đi UP và vị trí hiện tại <= tầng gọi (nằm trên hành trình đi lên).
   */
  public canBeServedBy(elevator: IElevatorContext): boolean {
    if (elevator.isIdle()) {
      return true;
    }
    if (elevator.isMovingUp() && elevator.getCurrentFloor() <= this.targetFloor) {
      return true;
    }
    return false;
  }
}
