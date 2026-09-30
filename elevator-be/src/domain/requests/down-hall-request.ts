import { Direction } from '../enums/direction.enum';
import { RequestType } from '../enums/request-type.enum';
import { IElevatorContext } from '../entities/elevator-context.interface';
import { HallRequest } from './hall-request';

export class DownHallRequest extends HallRequest {
  constructor(targetFloor: number) {
    super(targetFloor, Direction.DOWN);
  }

  public getType(): RequestType {
    return RequestType.DOWN_HALL;
  }

  /**
   * Tính đa hình:
   * Thang máy phục vụ được yêu cầu DOWN nếu:
   * 1. Thang đang IDLE tại bất kỳ tầng nào.
   * 2. Hoặc thang đang đi DOWN và vị trí hiện tại >= tầng gọi (nằm trên hành trình đi xuống).
   */
  public canBeServedBy(elevator: IElevatorContext): boolean {
    if (elevator.isIdle()) {
      return true;
    }
    if (elevator.isMovingDown() && elevator.getCurrentFloor() >= this.targetFloor) {
      return true;
    }
    return false;
  }
}
