import { Elevator } from './elevator';
import { UpHallRequest } from '../requests/up-hall-request';
import { DownHallRequest } from '../requests/down-hall-request';
import { Direction } from '../enums/direction.enum';
import { ElevatorState } from '../enums/elevator-state.enum';
import { DoorState } from '../enums/door-state.enum';

describe('Elevator Entity - LOOK Algorithm & State Machine', () => {
  let elevator: Elevator;

  beforeEach(() => {
    elevator = new Elevator(1, 1); // ID 1, Floor 1
  });

  it('should initialize at Floor 1 with IDLE state and CLOSED door', () => {
    expect(elevator.getCurrentFloor()).toBe(1);
    expect(elevator.getDirection()).toBe(Direction.IDLE);
    expect(elevator.getState()).toBe(ElevatorState.IDLE);
    expect(elevator.getDoorState()).toBe(DoorState.CLOSED);
  });

  it('should immediately open door when destination request is at current floor and door is closed', () => {
    elevator.addDestination(1);
    expect(elevator.getState()).toBe(ElevatorState.DOOR_OPENING);
  });

  it('should move UP to pick up an UpHallRequest and stop at the destination', () => {
    elevator.assignHallRequest(new UpHallRequest(3));
    expect(elevator.getDirection()).toBe(Direction.UP);
    expect(elevator.getState()).toBe(ElevatorState.MOVING_UP);

    // Tick 1: Floor 1 -> Floor 2
    let events = elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(2);
    expect(elevator.getState()).toBe(ElevatorState.MOVING_UP);

    // Tick 2: Floor 2 -> Floor 3 (Arrival & Open door)
    events = elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(3);
    expect(elevator.getState()).toBe(ElevatorState.DOOR_OPENING);
    expect(events.some((e) => e.type === 'ELEVATOR_ARRIVED')).toBe(true);

    // Passenger enters and chooses Floor 5
    elevator.addDestination(5);

    // Wait for door to complete opening, dwell, and close
    elevator.tick(); // DOOR_OPEN (dwell 3)
    elevator.tick(); // DOOR_OPEN (dwell 2)
    elevator.tick(); // DOOR_OPEN (dwell 1)
    elevator.tick(); // DOOR_CLOSING
    elevator.tick(); // DOOR_CLOSED -> starts MOVING_UP to Floor 5

    expect(elevator.getState()).toBe(ElevatorState.MOVING_UP);
  });

  it('Requirement Spec Test: Elevator moving UP should stop for UP call and NOT stop for DOWN call on the way up', () => {
    // Elevator starts at floor 1
    elevator.addDestination(10); // Car destination is Floor 10
    elevator.assignHallRequest(new UpHallRequest(5));   // User on Floor 5 wants to go UP
    elevator.assignHallRequest(new DownHallRequest(4)); // User on Floor 4 wants to go DOWN

    expect(elevator.getState()).toBe(ElevatorState.MOVING_UP);

    // Move Floor 1 -> 2
    elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(2);

    // Move Floor 2 -> 3
    elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(3);

    // Move Floor 3 -> 4: Must NOT stop for DownHallRequest at Floor 4!
    elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(4);
    expect(elevator.getState()).toBe(ElevatorState.MOVING_UP); // Continued moving!

    // Move Floor 4 -> 5: MUST STOP for UpHallRequest at Floor 5!
    const events = elevator.tick();
    expect(elevator.getCurrentFloor()).toBe(5);
    expect(elevator.getState()).toBe(ElevatorState.DOOR_OPENING);
    expect(events.some((e) => e.type === 'ELEVATOR_ARRIVED')).toBe(true);
  });
});
