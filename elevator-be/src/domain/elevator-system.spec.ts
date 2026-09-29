import { ElevatorSystem } from './elevator-system';
import { Direction } from './enums/direction.enum';

describe('ElevatorSystem Aggregate Root', () => {
  let system: ElevatorSystem;

  beforeEach(() => {
    system = new ElevatorSystem(3);
  });

  it('should initialize 3 elevators all at Floor 1', () => {
    const elevators = system.getElevators();
    expect(elevators.length).toBe(3);
    for (const e of elevators) {
      expect(e.getCurrentFloor()).toBe(1);
      expect(e.getDirection()).toBe(Direction.IDLE);
    }
  });

  it('should allow calling elevator from hall and assign to suitable elevator', () => {
    const res = system.callElevator(4, Direction.UP);
    expect(res.assignedElevatorId).toBeDefined();
    expect(res.request.getTargetFloor()).toBe(4);
    expect(res.request.getDirection()).toBe(Direction.UP);
  });

  it('should reject invalid boundary hall calls', () => {
    // Cannot call DOWN on Floor 1
    expect(() => system.callElevator(1, Direction.DOWN)).toThrow();
    // Cannot call UP on Floor 10
    expect(() => system.callElevator(10, Direction.UP)).toThrow();
    // Cannot call outside 1-10
    expect(() => system.callElevator(11, Direction.UP)).toThrow();
  });

  it('should allow selecting destination and control doors', () => {
    const successDest = system.selectDestination(1, 7);
    expect(successDest).toBe(true);

    const snapshot = system.getSnapshot();
    expect(snapshot.elevators[0].destinationRequests).toContain(7);

    // Door controls
    expect(system.pressOpenDoor(1)).toBeDefined();
    expect(system.pressCloseDoor(1)).toBeDefined();
  });

  it('should tick all elevators and produce snapshots', () => {
    system.selectDestination(1, 3);
    const events = system.tick();
    expect(events.length).toBeGreaterThan(0);
  });
});
