import { Direction } from '../enums/direction.enum';
import { Elevator } from '../entities/elevator';
import { HallRequest } from '../requests/hall-request';
import { ElevatorSelectionStrategy } from './selection-strategy.interface';
import { ELEVATOR_CONSTANTS } from '../constants/elevator.constants';

export class NearestSuitableElevatorStrategy implements ElevatorSelectionStrategy {
  public select(elevators: Elevator[], request: HallRequest): Elevator {
    if (elevators.length === 0) {
      throw new Error('No elevators available to select.');
    }

    let bestElevator: Elevator = elevators[0];
    let minCost = Number.POSITIVE_INFINITY;

    for (const elevator of elevators) {
      const cost = this.calculateCost(elevator, request);
      if (cost < minCost) {
        minCost = cost;
        bestElevator = elevator;
      }
    }

    return bestElevator;
  }

  public calculateCost(elevator: Elevator, request: HallRequest): number {
    const currentFloor = elevator.getCurrentFloor();
    const targetFloor = request.getTargetFloor();
    const requestDir = request.getDirection();
    const elevatorDir = elevator.getDirection();
    const pendingLoad = elevator.getDestinationRequests().length + elevator.getHallRequests().length;

    // 1. Thang đang IDLE
    if (elevator.isIdle()) {
      return Math.abs(currentFloor - targetFloor) + pendingLoad;
    }

    // 2. Thang đang đi UP và cùng hướng đón trên đường đi
    if (elevatorDir === Direction.UP && requestDir === Direction.UP && currentFloor <= targetFloor) {
      return (targetFloor - currentFloor) + pendingLoad * 0.5;
    }

    // 3. Thang đang đi DOWN và cùng hướng đón trên đường đi
    if (elevatorDir === Direction.DOWN && requestDir === Direction.DOWN && currentFloor >= targetFloor) {
      return (currentFloor - targetFloor) + pendingLoad * 0.5;
    }

    // 4. Thang ngược chiều hoặc đã đi qua tầng gọi (cần hoàn thành hành trình rồi quay đầu)
    const PENALTY_REVERSAL = 15;
    const maxBound = ELEVATOR_CONSTANTS.MAX_FLOOR;
    const minBound = ELEVATOR_CONSTANTS.MIN_FLOOR;

    if (elevatorDir === Direction.UP) {
      // Đi hết lên trên cùng rồi vòng xuống targetFloor
      return (maxBound - currentFloor) + Math.abs(maxBound - targetFloor) + PENALTY_REVERSAL + pendingLoad;
    } else {
      // Đi hết xuống dưới cùng rồi vòng lên targetFloor
      return (currentFloor - minBound) + Math.abs(targetFloor - minBound) + PENALTY_REVERSAL + pendingLoad;
    }
  }
}
