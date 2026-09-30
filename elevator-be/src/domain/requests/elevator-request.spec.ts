import { UpHallRequest } from './up-hall-request';
import { DownHallRequest } from './down-hall-request';
import { DestinationRequest } from './destination-request';
import { RequestType } from '../enums/request-type.enum';
import { Direction } from '../enums/direction.enum';
import { ElevatorState } from '../enums/elevator-state.enum';
import { DoorState } from '../enums/door-state.enum';
import { IElevatorContext } from '../entities/elevator-context.interface';

describe('ElevatorRequest Hierarchy & Polymorphism', () => {
  const createMockElevator = (
    id: number,
    floor: number,
    direction: Direction,
    state: ElevatorState,
  ): IElevatorContext => ({
    getId: () => id,
    getCurrentFloor: () => floor,
    getDirection: () => direction,
    getState: () => state,
    getDoorState: () => DoorState.CLOSED,
    isMovingUp: () => direction === Direction.UP,
    isMovingDown: () => direction === Direction.DOWN,
    isIdle: () => state === ElevatorState.IDLE,
  });

  describe('UpHallRequest Polymorphism', () => {
    const upReq = new UpHallRequest(5);

    it('should have type UP_HALL', () => {
      expect(upReq.getType()).toBe(RequestType.UP_HALL);
      expect(upReq.getTargetFloor()).toBe(5);
      expect(upReq.getDirection()).toBe(Direction.UP);
    });

    it('can be served by IDLE elevator anywhere', () => {
      const idleElevator = createMockElevator(1, 1, Direction.IDLE, ElevatorState.IDLE);
      expect(upReq.canBeServedBy(idleElevator)).toBe(true);
    });

    it('can be served by elevator moving UP below target floor (Floor 3 <= 5)', () => {
      const upElevator = createMockElevator(1, 3, Direction.UP, ElevatorState.MOVING_UP);
      expect(upReq.canBeServedBy(upElevator)).toBe(true);
    });

    it('CANNOT be served by elevator moving UP above target floor (Floor 7 > 5)', () => {
      const upElevator = createMockElevator(1, 7, Direction.UP, ElevatorState.MOVING_UP);
      expect(upReq.canBeServedBy(upElevator)).toBe(false);
    });

    it('CANNOT be served by elevator moving DOWN', () => {
      const downElevator = createMockElevator(1, 8, Direction.DOWN, ElevatorState.MOVING_DOWN);
      expect(upReq.canBeServedBy(downElevator)).toBe(false);
    });
  });

  describe('DownHallRequest Polymorphism', () => {
    const downReq = new DownHallRequest(4);

    it('should have type DOWN_HALL', () => {
      expect(downReq.getType()).toBe(RequestType.DOWN_HALL);
      expect(downReq.getTargetFloor()).toBe(4);
      expect(downReq.getDirection()).toBe(Direction.DOWN);
    });

    it('can be served by elevator moving DOWN above target floor (Floor 7 >= 4)', () => {
      const downElevator = createMockElevator(1, 7, Direction.DOWN, ElevatorState.MOVING_DOWN);
      expect(downReq.canBeServedBy(downElevator)).toBe(true);
    });

    it('CANNOT be served by elevator moving DOWN below target floor (Floor 2 < 4)', () => {
      const downElevator = createMockElevator(1, 2, Direction.DOWN, ElevatorState.MOVING_DOWN);
      expect(downReq.canBeServedBy(downElevator)).toBe(false);
    });

    it('CANNOT be served by elevator moving UP', () => {
      const upElevator = createMockElevator(1, 2, Direction.UP, ElevatorState.MOVING_UP);
      expect(downReq.canBeServedBy(upElevator)).toBe(false);
    });
  });

  describe('DestinationRequest Polymorphism', () => {
    const destReq = new DestinationRequest(8, 2); // Floor 8 for Elevator 2

    it('should have type DESTINATION', () => {
      expect(destReq.getType()).toBe(RequestType.DESTINATION);
      expect(destReq.getTargetFloor()).toBe(8);
      expect(destReq.getTargetElevatorId()).toBe(2);
    });

    it('CANNOT be served by another elevator ID', () => {
      const elevator1 = createMockElevator(1, 1, Direction.IDLE, ElevatorState.IDLE);
      expect(destReq.canBeServedBy(elevator1)).toBe(false);
    });

    it('can be served by assigned elevator ID', () => {
      const elevator2 = createMockElevator(2, 3, Direction.UP, ElevatorState.MOVING_UP);
      expect(destReq.canBeServedBy(elevator2)).toBe(true);
    });
  });
});
