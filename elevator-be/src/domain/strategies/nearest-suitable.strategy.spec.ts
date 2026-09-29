import { NearestSuitableElevatorStrategy } from './nearest-suitable.strategy';
import { Elevator } from '../entities/elevator';
import { UpHallRequest } from '../requests/up-hall-request';
import { DownHallRequest } from '../requests/down-hall-request';
import { Direction } from '../enums/direction.enum';

describe('NearestSuitableElevatorStrategy', () => {
  let strategy: NearestSuitableElevatorStrategy;
  let elevators: Elevator[];

  beforeEach(() => {
    strategy = new NearestSuitableElevatorStrategy();
    elevators = [
      new Elevator(1, 1),  // Elevator 1 at Floor 1 (IDLE)
      new Elevator(2, 5),  // Elevator 2 at Floor 5 (IDLE)
      new Elevator(3, 10), // Elevator 3 at Floor 10 (IDLE)
    ];
  });

  it('should select the nearest IDLE elevator for Hall Request', () => {
    // User at Floor 6 calls UP
    const req = new UpHallRequest(6);
    const selected = strategy.select(elevators, req);

    // Elevator 2 is at Floor 5 (distance 1), Elevator 3 is at Floor 10 (distance 4), Elevator 1 is at Floor 1 (distance 5)
    expect(selected.getId()).toBe(2);
  });

  it('should prefer an elevator moving UP towards the floor over an IDLE elevator farther away', () => {
    // Elevator 1 at Floor 2 moving UP towards Floor 8
    elevators[0].addDestination(8); // Now moving UP at Floor 2
    // Elevator 2 at Floor 1 (IDLE)
    // Elevator 3 at Floor 10 (IDLE)

    // User at Floor 5 calls UP
    const req = new UpHallRequest(5);
    const selected = strategy.select(elevators, req);

    // Elevator 1 is at Floor 2 going UP -> distance 3
    // Elevator 2 is at Floor 5 (distance 0) or if Elevator 2 is at 1 -> distance 4
    expect(selected.getId()).toBe(2); // Elevator 2 at Floor 5 distance 0
  });

  it('should penalize an elevator moving in opposite direction', () => {
    // Elevator 1 at Floor 8 moving UP to Floor 10
    elevators[0] = new Elevator(1, 8);
    elevators[0].addDestination(10);

    // Elevator 2 at Floor 7 (IDLE)
    elevators[1] = new Elevator(2, 7);

    // User at Floor 6 calls DOWN
    const req = new DownHallRequest(6);
    const selected = strategy.select(elevators, req);

    // Elevator 2 at Floor 7 (IDLE) has cost |7 - 6| = 1
    // Elevator 1 is moving UP (opposite to DOWN call at Floor 6) -> huge penalty
    expect(selected.getId()).toBe(2);
  });
});
