import { Elevator } from '../entities/elevator';
import { HallRequest } from '../requests/hall-request';
import { ElevatorSelectionStrategy } from './selection-strategy.interface';
import { NearestSuitableElevatorStrategy } from './nearest-suitable.strategy';

export class ElevatorDispatcher {
  private strategy: ElevatorSelectionStrategy;

  constructor(strategy?: ElevatorSelectionStrategy) {
    this.strategy = strategy ?? new NearestSuitableElevatorStrategy();
  }

  public setStrategy(strategy: ElevatorSelectionStrategy): void {
    this.strategy = strategy;
  }

  public dispatch(elevators: Elevator[], request: HallRequest): Elevator {
    const selectedElevator = this.strategy.select(elevators, request);
    selectedElevator.assignHallRequest(request);
    return selectedElevator;
  }
}
