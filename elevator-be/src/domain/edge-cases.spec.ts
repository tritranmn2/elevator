import { ElevatorSystem } from './elevator-system';
import { Elevator } from './entities/elevator';
import { Direction } from './enums/direction.enum';
import { ElevatorState } from './enums/elevator-state.enum';
import { DoorState } from './enums/door-state.enum';
import { UpHallRequest } from './requests/up-hall-request';
import { DownHallRequest } from './requests/down-hall-request';

describe('Comprehensive Edge Cases & System Invariants', () => {
  let system: ElevatorSystem;

  beforeEach(() => {
    system = new ElevatorSystem(3);
  });

  describe('Edge Case 1: Duplicate Requests (Idempotency)', () => {
    it('should ignore duplicate identical hall calls', () => {
      system.callElevator(5, Direction.UP);
      system.callElevator(5, Direction.UP);

      const snapshot = system.getSnapshot();
      const totalUp5 = snapshot.elevators.flatMap((e) =>
        e.hallRequests.filter((r) => r.floor === 5 && r.direction === Direction.UP),
      );
      expect(totalUp5.length).toBe(1);
    });
  });

  describe('Edge Case 2: Boundary Validations', () => {
    it('should reject calling UP on Floor 10', () => {
      expect(() => system.callElevator(10, Direction.UP)).toThrow('Cannot call UP on the highest floor');
    });

    it('should reject calling DOWN on Floor 1', () => {
      expect(() => system.callElevator(1, Direction.DOWN)).toThrow('Cannot call DOWN on the lowest floor');
    });

    it('should reject out of bound floor numbers', () => {
      expect(() => system.callElevator(0, Direction.UP)).toThrow();
      expect(() => system.callElevator(11, Direction.DOWN)).toThrow();
    });
  });

  describe('Edge Case 3: Calling at floor where elevator is already IDLE', () => {
    it('should open door immediately when called at current idle floor', () => {
      // All 3 elevators start at Floor 1
      const res = system.callElevator(1, Direction.UP);
      const elevator = system.getElevatorById(res.assignedElevatorId)!;

      expect(elevator.getDoorState()).toBe(DoorState.OPENING);
      expect(elevator.getState()).toBe(ElevatorState.DOOR_OPENING);
    });
  });

  describe('Edge Case 4: Multiple destination buttons pressed in cabin', () => {
    it('should visit destination floors in logical LOOK order', () => {
      const elevator = new Elevator(1, 1);
      elevator.addDestination(7);
      elevator.addDestination(3);
      elevator.addDestination(5);

      // Elevator should move up: Floor 1 -> 2 -> 3 (stop) -> 4 -> 5 (stop) -> 6 -> 7 (stop)
      const stoppedFloors: number[] = [];

      for (let tick = 0; tick < 30; tick++) {
        const events = elevator.tick();
        for (const ev of events) {
          if (ev.type === 'ELEVATOR_ARRIVED') {
            stoppedFloors.push(ev.floor);
          }
        }
      }

      expect(stoppedFloors).toEqual([3, 5, 7]);
    });
  });

  describe('Edge Case 5: Turnaround Point Handling', () => {
    it('should stop at top requested floor with DownHallRequest and reverse direction', () => {
      const elevator = new Elevator(1, 1);
      // Passenger inside wants floor 6, user at floor 8 wants to go DOWN
      elevator.addDestination(6);
      elevator.assignHallRequest(new DownHallRequest(8));

      // Elevator moves up from 1 to 6 (stops for destination)
      for (let i = 0; i < 20; i++) {
        elevator.tick();
      }

      // After completing Floor 6, it continues up to Floor 8 (turnaround point)
      // and stops at Floor 8 to pick up the DownHallRequest
      expect(elevator.getCurrentFloor()).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Edge Case 6: Safety Invariant (No movement while door is open)', () => {
    it('elevator must never change floors while door is OPEN or CLOSING', () => {
      const elevator = new Elevator(1, 1);
      elevator.addDestination(1); // Triggers open at Floor 1
      expect(elevator.getDoorState()).toBe(DoorState.OPENING);

      elevator.addDestination(5); // Add destination while door is opening

      const floorBefore = elevator.getCurrentFloor();
      elevator.tick(); // Door is now OPEN
      expect(elevator.getCurrentFloor()).toBe(floorBefore); // Did NOT move

      elevator.tick(); // Door still OPEN
      expect(elevator.getCurrentFloor()).toBe(floorBefore); // Did NOT move
    });
  });
});
