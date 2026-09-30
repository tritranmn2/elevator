import { RequestType } from '../enums/request-type.enum';
import { IElevatorContext } from '../entities/elevator-context.interface';
import { ElevatorRequest } from './elevator-request';

export class DestinationRequest extends ElevatorRequest {
  private readonly targetElevatorId: number;

  constructor(targetFloor: number, targetElevatorId: number) {
    super(targetFloor);
    this.targetElevatorId = targetElevatorId;
  }

  public getTargetElevatorId(): number {
    return this.targetElevatorId;
  }

  public getType(): RequestType {
    return RequestType.DESTINATION;
  }

  /**
   * Tính đa hình:
   * Yêu cầu chọn tầng trong cabin (Destination) gắn liền với cabin cụ thể.
   * Thang máy chỉ phục vụ nếu nó chính là thang được chọn.
   */
  public canBeServedBy(elevator: IElevatorContext): boolean {
    if (elevator.getId() !== this.targetElevatorId) {
      return false;
    }
    if (elevator.isIdle()) {
      return true;
    }
    // Nếu thang đang đi UP thì tầng đích phải >= currentFloor
    if (elevator.isMovingUp() && elevator.getCurrentFloor() <= this.targetFloor) {
      return true;
    }
    // Nếu thang đang đi DOWN thì tầng đích phải <= currentFloor
    if (elevator.isMovingDown() && elevator.getCurrentFloor() >= this.targetFloor) {
      return true;
    }
    return false;
  }
}
