import { Door } from './door';
import { DoorState } from '../enums/door-state.enum';

describe('Door Entity & Dwell Timer Lifecycle', () => {
  let door: Door;

  beforeEach(() => {
    door = new Door(3); // 3 ticks dwell
  });

  it('should initialize with CLOSED state', () => {
    expect(door.getState()).toBe(DoorState.CLOSED);
    expect(door.isClosed()).toBe(true);
    expect(door.isOpen()).toBe(false);
  });

  it('should transition: CLOSED -> OPENING -> OPEN (dwell 3) -> CLOSING -> CLOSED', () => {
    door.triggerOpen();
    expect(door.getState()).toBe(DoorState.OPENING);

    // Tick 1: OPENING -> OPEN (dwell = 3)
    let res = door.tick();
    expect(res.newState).toBe(DoorState.OPEN);
    expect(door.getDwellTicksRemaining()).toBe(3);

    // Tick 2: OPEN (dwell = 2)
    res = door.tick();
    expect(res.newState).toBe(DoorState.OPEN);
    expect(door.getDwellTicksRemaining()).toBe(2);

    // Tick 3: OPEN (dwell = 1)
    res = door.tick();
    expect(res.newState).toBe(DoorState.OPEN);
    expect(door.getDwellTicksRemaining()).toBe(1);

    // Tick 4: Dwell expired -> CLOSING
    res = door.tick();
    expect(res.newState).toBe(DoorState.CLOSING);

    // Tick 5: CLOSING -> CLOSED
    res = door.tick();
    expect(res.newState).toBe(DoorState.CLOSED);
    expect(door.isClosed()).toBe(true);
  });

  it('should reset dwell timer when pressOpen is called while OPEN', () => {
    door.triggerOpen();
    door.tick(); // Now OPEN, dwell = 3
    door.tick(); // Now OPEN, dwell = 2

    expect(door.getDwellTicksRemaining()).toBe(2);
    door.pressOpen();
    expect(door.getDwellTicksRemaining()).toBe(3); // Reset back to max
  });

  it('should immediately reverse to OPENING when pressOpen is called while CLOSING', () => {
    door.triggerOpen();
    door.tick(); // OPEN
    door.tick(); // OPEN
    door.tick(); // OPEN
    door.tick(); // CLOSING
    expect(door.getState()).toBe(DoorState.CLOSING);

    door.pressOpen();
    expect(door.getState()).toBe(DoorState.OPENING);
  });

  it('should immediately close when pressClose is called while OPEN', () => {
    door.triggerOpen();
    door.tick(); // OPEN, dwell = 3
    expect(door.getState()).toBe(DoorState.OPEN);

    const success = door.pressClose();
    expect(success).toBe(true);
    expect(door.getState()).toBe(DoorState.CLOSING);
    expect(door.getDwellTicksRemaining()).toBe(0);

    door.tick(); // CLOSING -> CLOSED
    expect(door.getState()).toBe(DoorState.CLOSED);
  });
});
