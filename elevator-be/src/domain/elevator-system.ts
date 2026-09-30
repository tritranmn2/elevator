import { Elevator } from './entities/elevator';
import { Direction } from './enums/direction.enum';
import { UpHallRequest } from './requests/up-hall-request';
import { DownHallRequest } from './requests/down-hall-request';
import { HallRequest } from './requests/hall-request';
import { ElevatorDispatcher } from './strategies/elevator-dispatcher';
import { ELEVATOR_CONSTANTS } from './constants/elevator.constants';
import { SystemSnapshot } from './snapshots/elevator-snapshot';
import { ElevatorEvent } from './events/elevator-event';
import { SYSTEM_MESSAGES } from './constants/messages.constants';

export class ElevatorSystem {
  private readonly elevators: Elevator[] = [];
  private readonly dispatcher: ElevatorDispatcher;

  constructor(numElevators: number = ELEVATOR_CONSTANTS.NUM_ELEVATORS, dispatcher?: ElevatorDispatcher) {
    this.dispatcher = dispatcher ?? new ElevatorDispatcher();
    for (let id = 1; id <= numElevators; id++) {
      this.elevators.push(new Elevator(id, ELEVATOR_CONSTANTS.MIN_FLOOR));
    }
  }

  public getElevators(): Elevator[] {
    return this.elevators;
  }

  public getElevatorById(id: number): Elevator | undefined {
    return this.elevators.find((e) => e.getId() === id);
  }

  /**
   * Gọi thang máy từ sảnh (Hall Call)
   */
  public callElevator(floor: number, direction: Direction): { assignedElevatorId: number; request: HallRequest } {
    if (floor < ELEVATOR_CONSTANTS.MIN_FLOOR || floor > ELEVATOR_CONSTANTS.MAX_FLOOR) {
      throw new Error(SYSTEM_MESSAGES.ERROR.FLOOR_RANGE(ELEVATOR_CONSTANTS.MIN_FLOOR, ELEVATOR_CONSTANTS.MAX_FLOOR));
    }

    if (floor === ELEVATOR_CONSTANTS.MAX_FLOOR && direction === Direction.UP) {
      throw new Error(SYSTEM_MESSAGES.ERROR.CANNOT_CALL_UP_HIGHEST);
    }

    if (floor === ELEVATOR_CONSTANTS.MIN_FLOOR && direction === Direction.DOWN) {
      throw new Error(SYSTEM_MESSAGES.ERROR.CANNOT_CALL_DOWN_LOWEST);
    }

    // System-level Idempotency: Nếu đã có thang nào đang giữ Hall Request này thì không tạo thêm
    for (const elevator of this.elevators) {
      for (const req of elevator.getHallRequests()) {
        if (req.floor === floor && req.direction === direction) {
          return {
            assignedElevatorId: elevator.getId(),
            request: direction === Direction.UP ? new UpHallRequest(floor) : new DownHallRequest(floor),
          };
        }
      }
    }

    const request: HallRequest =
      direction === Direction.UP ? new UpHallRequest(floor) : new DownHallRequest(floor);

    const assignedElevator = this.dispatcher.dispatch(this.elevators, request);
    return {
      assignedElevatorId: assignedElevator.getId(),
      request,
    };
  }

  /**
   * Chọn tầng đích bên trong cabin (Destination Car Call)
   */
  public selectDestination(elevatorId: number, floor: number): boolean {
    const elevator = this.getElevatorById(elevatorId);
    if (!elevator) {
      throw new Error(SYSTEM_MESSAGES.ERROR.ELEVATOR_NOT_FOUND(elevatorId));
    }
    return elevator.addDestination(floor);
  }

  /**
   * Nhấn nút Open cửa tại thang máy cụ thể
   */
  public pressOpenDoor(elevatorId: number): boolean {
    const elevator = this.getElevatorById(elevatorId);
    if (!elevator) {
      throw new Error(SYSTEM_MESSAGES.ERROR.ELEVATOR_NOT_FOUND(elevatorId));
    }
    return elevator.pressOpenDoor();
  }

  /**
   * Nhấn nút Close cửa tại thang máy cụ thể
   */
  public pressCloseDoor(elevatorId: number): boolean {
    const elevator = this.getElevatorById(elevatorId);
    if (!elevator) {
      throw new Error(SYSTEM_MESSAGES.ERROR.ELEVATOR_NOT_FOUND(elevatorId));
    }
    return elevator.pressCloseDoor();
  }

  /**
   * Chạy một nhịp Simulation Tick trên toàn bộ hệ thống
   */
  public tick(): ElevatorEvent[] {
    const allEvents: ElevatorEvent[] = [];
    for (const elevator of this.elevators) {
      const events = elevator.tick();
      allEvents.push(...events);
    }
    return allEvents;
  }

  /**
   * Lấy snapshot dữ liệu toàn hệ thống phục vụ WebSocket/REST
   */
  public getSnapshot(): SystemSnapshot {
    return {
      timestamp: Date.now(),
      elevators: this.elevators.map((e) => e.getSnapshot()),
    };
  }
}
