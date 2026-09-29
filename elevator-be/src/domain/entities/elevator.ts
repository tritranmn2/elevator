import { Direction } from '../enums/direction.enum';
import { DoorState } from '../enums/door-state.enum';
import { ElevatorState } from '../enums/elevator-state.enum';
import { ELEVATOR_CONSTANTS } from '../constants/elevator.constants';
import { Door } from './door';
import { IElevatorContext } from './elevator-context.interface';
import { HallRequest } from '../requests/hall-request';
import { ElevatorSnapshot } from '../snapshots/elevator-snapshot';
import { ElevatorEvent } from '../events/elevator-event';

export class Elevator implements IElevatorContext {
  private readonly id: number;
  private currentFloor: number;
  private direction: Direction = Direction.IDLE;
  private state: ElevatorState = ElevatorState.IDLE;
  private readonly door: Door;

  // Requests quản lý theo OOP
  private readonly destinationRequests: Set<number> = new Set();
  private readonly hallRequests: Set<HallRequest> = new Set();

  constructor(id: number, initialFloor: number = ELEVATOR_CONSTANTS.MIN_FLOOR) {
    this.id = id;
    this.currentFloor = initialFloor;
    this.door = new Door(ELEVATOR_CONSTANTS.DEFAULT_DOOR_DWELL_TICKS);
  }

  // === IElevatorContext Interface Implementation ===

  public getId(): number {
    return this.id;
  }

  public getCurrentFloor(): number {
    return this.currentFloor;
  }

  public getDirection(): Direction {
    return this.direction;
  }

  public getState(): ElevatorState {
    return this.state;
  }

  public getDoorState(): DoorState {
    return this.door.getState();
  }

  public isMovingUp(): boolean {
    return this.direction === Direction.UP && (this.state === ElevatorState.MOVING_UP || this.state === ElevatorState.IDLE);
  }

  public isMovingDown(): boolean {
    return this.direction === Direction.DOWN && (this.state === ElevatorState.MOVING_DOWN || this.state === ElevatorState.IDLE);
  }

  public isIdle(): boolean {
    return this.state === ElevatorState.IDLE && this.destinationRequests.size === 0 && this.hallRequests.size === 0;
  }

  // === Request Management ===

  public addDestination(targetFloor: number): boolean {
    if (targetFloor < ELEVATOR_CONSTANTS.MIN_FLOOR || targetFloor > ELEVATOR_CONSTANTS.MAX_FLOOR) {
      return false;
    }

    // Nếu đang đỗ tại chính tầng đích và cửa đang mở
    if (this.currentFloor === targetFloor && !this.door.isClosed()) {
      this.door.pressOpen();
      return true;
    }

    this.destinationRequests.add(targetFloor);

    // Nếu thang đang IDLE, kích hoạt hướng di chuyển
    if (this.state === ElevatorState.IDLE) {
      this.evaluateNextAction();
    }
    return true;
  }

  public assignHallRequest(request: HallRequest): void {
    // Tránh duplicate request
    for (const req of this.hallRequests) {
      if (req.getTargetFloor() === request.getTargetFloor() && req.getDirection() === request.getDirection()) {
        return;
      }
    }
    this.hallRequests.add(request);

    // Nếu thang đang IDLE, kích hoạt hướng di chuyển
    if (this.state === ElevatorState.IDLE) {
      this.evaluateNextAction();
    }
  }

  public getDestinationRequests(): number[] {
    return Array.from(this.destinationRequests).sort((a, b) => a - b);
  }

  public getHallRequests(): { floor: number; direction: Direction }[] {
    return Array.from(this.hallRequests).map((r) => ({
      floor: r.getTargetFloor(),
      direction: r.getDirection(),
    }));
  }

  // === Door Controls ===

  public pressOpenDoor(): boolean {
    // Không cho phép mở cửa khi thang đang di chuyển giữa các tầng (Safety Invariant)
    if (this.state === ElevatorState.MOVING_UP || this.state === ElevatorState.MOVING_DOWN) {
      return false;
    }
    const success = this.door.pressOpen();
    if (success) {
      this.syncStateWithDoor();
    }
    return success;
  }

  public pressCloseDoor(): boolean {
    if (this.door.isOpen()) {
      const success = this.door.pressClose();
      if (success) {
        this.syncStateWithDoor();
      }
      return success;
    }
    return false;
  }

  // === Core Simulation Tick (LOOK Algorithm & State Machine) ===

  public tick(): ElevatorEvent[] {
    const events: ElevatorEvent[] = [];
    const timestamp = Date.now();

    // 1. Nếu cửa chưa đóng, ưu tiên xử lý chu trình cửa
    if (!this.door.isClosed()) {
      const doorResult = this.door.tick();
      this.syncStateWithDoor();

      if (doorResult.stateChanged) {
        events.push({
          type: 'DOOR_STATE_CHANGED',
          elevatorId: this.id,
          doorState: this.door.getState(),
          floor: this.currentFloor,
          timestamp,
        });
      }

      // Khi cửa vừa đóng xong hoàn toàn, đánh giá hành động tiếp theo
      if (this.door.isClosed()) {
        this.evaluateNextAction();
      }
      return events;
    }

    // 2. Cửa đã đóng hoàn toàn -> Xử lý di chuyển
    switch (this.state) {
      case ElevatorState.MOVING_UP: {
        const fromFloor = this.currentFloor;
        this.currentFloor++;
        events.push({
          type: 'ELEVATOR_MOVED',
          elevatorId: this.id,
          fromFloor,
          toFloor: this.currentFloor,
          direction: Direction.UP,
          timestamp,
        });

        if (this.shouldStopAtCurrentFloor(Direction.UP)) {
          this.stopAndOpenDoor(events, timestamp, Direction.UP);
        }
        break;
      }

      case ElevatorState.MOVING_DOWN: {
        const fromFloor = this.currentFloor;
        this.currentFloor--;
        events.push({
          type: 'ELEVATOR_MOVED',
          elevatorId: this.id,
          fromFloor,
          toFloor: this.currentFloor,
          direction: Direction.DOWN,
          timestamp,
        });

        if (this.shouldStopAtCurrentFloor(Direction.DOWN)) {
          this.stopAndOpenDoor(events, timestamp, Direction.DOWN);
        }
        break;
      }

      case ElevatorState.IDLE: {
        this.evaluateNextAction();
        // Nếu sau khi evaluate cần dừng mở cửa tại tầng hiện tại
        if ((this.state as ElevatorState) === ElevatorState.DOOR_OPENING) {
          events.push({
            type: 'DOOR_STATE_CHANGED',
            elevatorId: this.id,
            doorState: this.door.getState(),
            floor: this.currentFloor,
            timestamp,
          });
        }
        break;
      }

      default:
        break;
    }

    return events;
  }

  // === Helper Domain Methods ===

  private syncStateWithDoor(): void {
    const doorState = this.door.getState();
    if (doorState === DoorState.OPENING) {
      this.state = ElevatorState.DOOR_OPENING;
    } else if (doorState === DoorState.OPEN) {
      this.state = ElevatorState.DOOR_OPEN;
    } else if (doorState === DoorState.CLOSING) {
      this.state = ElevatorState.DOOR_CLOSING;
    } else if (doorState === DoorState.CLOSED && (this.state === ElevatorState.DOOR_CLOSING || this.state === ElevatorState.DOOR_OPENING)) {
      this.evaluateNextAction();
    }
  }

  /**
   * Thuật toán LOOK: Kiểm tra xem thang có cần dừng tại tầng hiện tại không
   */
  private shouldStopAtCurrentFloor(currentDir: Direction): boolean {
    // 1. Có lệnh trả khách tại tầng này (Destination)
    if (this.destinationRequests.has(this.currentFloor)) {
      return true;
    }

    // 2. Có lệnh gọi sảnh cùng chiều
    for (const req of this.hallRequests) {
      if (req.getTargetFloor() === this.currentFloor && req.getDirection() === currentDir) {
        return true;
      }
    }

    // 3. Tầng quay đầu (Turnaround Floor):
    // Không còn bất kỳ request nào phía trước theo chiều hiện tại, nhưng có request ở chính tầng này
    const hasRequestsAhead = this.hasRequestsInDirection(currentDir);
    if (!hasRequestsAhead) {
      for (const req of this.hallRequests) {
        if (req.getTargetFloor() === this.currentFloor) {
          return true;
        }
      }
    }

    return false;
  }

  private stopAndOpenDoor(events: ElevatorEvent[], timestamp: number, servedDirection: Direction): void {
    this.door.triggerOpen();
    this.state = ElevatorState.DOOR_OPENING;

    // Xóa Destination Request tại tầng này
    this.destinationRequests.delete(this.currentFloor);

    // Xóa Hall Requests đã được phục vụ
    for (const req of Array.from(this.hallRequests)) {
      if (req.getTargetFloor() === this.currentFloor) {
        // Phục vụ nếu cùng chiều, hoặc nếu đây là điểm quay đầu cuối cùng
        const hasAhead = this.hasRequestsInDirection(servedDirection);
        if (req.getDirection() === servedDirection || !hasAhead) {
          this.hallRequests.delete(req);
          events.push({
            type: 'REQUEST_COMPLETED',
            elevatorId: this.id,
            floor: this.currentFloor,
            direction: req.getDirection(),
            timestamp,
          });
        }
      }
    }

    events.push({
      type: 'ELEVATOR_ARRIVED',
      elevatorId: this.id,
      floor: this.currentFloor,
      direction: this.direction,
      timestamp,
    });
  }

  /**
   * Đánh giá và xác định hành động tiếp theo theo thuật toán LOOK
   */
  public evaluateNextAction(): void {
    if (!this.door.isClosed()) {
      return;
    }

    // Kiểm tra nếu có request tại chính tầng hiện tại
    if (this.shouldStopAtCurrentFloor(this.direction)) {
      this.door.triggerOpen();
      this.state = ElevatorState.DOOR_OPENING;
      this.destinationRequests.delete(this.currentFloor);
      for (const req of Array.from(this.hallRequests)) {
        if (req.getTargetFloor() === this.currentFloor) {
          this.hallRequests.delete(req);
        }
      }
      return;
    }

    const hasAbove = this.hasRequestsAbove();
    const hasBelow = this.hasRequestsBelow();

    if (this.direction === Direction.UP) {
      if (hasAbove) {
        this.state = ElevatorState.MOVING_UP;
      } else if (hasBelow) {
        this.direction = Direction.DOWN;
        this.state = ElevatorState.MOVING_DOWN;
      } else {
        this.direction = Direction.IDLE;
        this.state = ElevatorState.IDLE;
      }
    } else if (this.direction === Direction.DOWN) {
      if (hasBelow) {
        this.state = ElevatorState.MOVING_DOWN;
      } else if (hasAbove) {
        this.direction = Direction.UP;
        this.state = ElevatorState.MOVING_UP;
      } else {
        this.direction = Direction.IDLE;
        this.state = ElevatorState.IDLE;
      }
    } else {
      // Đang IDLE
      if (hasAbove) {
        this.direction = Direction.UP;
        this.state = ElevatorState.MOVING_UP;
      } else if (hasBelow) {
        this.direction = Direction.DOWN;
        this.state = ElevatorState.MOVING_DOWN;
      } else {
        this.direction = Direction.IDLE;
        this.state = ElevatorState.IDLE;
      }
    }
  }

  private hasRequestsInDirection(dir: Direction): boolean {
    return dir === Direction.UP ? this.hasRequestsAbove() : this.hasRequestsBelow();
  }

  private hasRequestsAbove(): boolean {
    for (const floor of this.destinationRequests) {
      if (floor > this.currentFloor) return true;
    }
    for (const req of this.hallRequests) {
      if (req.getTargetFloor() > this.currentFloor) return true;
    }
    return false;
  }

  private hasRequestsBelow(): boolean {
    for (const floor of this.destinationRequests) {
      if (floor < this.currentFloor) return true;
    }
    for (const req of this.hallRequests) {
      if (req.getTargetFloor() < this.currentFloor) return true;
    }
    return false;
  }

  public getSnapshot(): ElevatorSnapshot {
    return {
      id: this.id,
      currentFloor: this.currentFloor,
      direction: this.direction,
      state: this.state,
      doorState: this.door.getState(),
      destinationRequests: this.getDestinationRequests(),
      hallRequests: this.getHallRequests(),
    };
  }
}
