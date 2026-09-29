import { IElevatorContext } from '../entities/elevator-context.interface';
import { RequestType } from '../enums/request-type.enum';

export abstract class ElevatorRequest {
  protected readonly targetFloor: number;
  protected readonly createdAt: number;

  constructor(targetFloor: number) {
    this.targetFloor = targetFloor;
    this.createdAt = Date.now();
  }

  public getTargetFloor(): number {
    return this.targetFloor;
  }

  public getCreatedAt(): number {
    return this.createdAt;
  }

  /**
   * Tính đa hình (Polymorphism):
   * Từng loại request cụ thể tự quyết định xem một thang máy có thể phục vụ nó hay không.
   */
  public abstract canBeServedBy(elevator: IElevatorContext): boolean;

  public abstract getType(): RequestType;
}
