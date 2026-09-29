import { SimulationEngine } from './simulation.engine';
import { ElevatorSystem } from '../domain/elevator-system';
import { Direction } from '../domain/enums/direction.enum';

describe('SimulationEngine Realtime Loop', () => {
  let engine: SimulationEngine;
  let system: ElevatorSystem;

  beforeEach(() => {
    system = new ElevatorSystem(3);
    engine = new SimulationEngine(system);
  });

  afterEach(() => {
    engine.stop();
  });

  it('should notify subscribers on each simulation step', () => {
    let tickCount = 0;
    const unsubscribe = engine.subscribe((snapshot, events) => {
      tickCount++;
      expect(snapshot.elevators.length).toBe(3);
    });

    system.callElevator(3, Direction.UP);
    const { snapshot, events } = engine.step();

    expect(tickCount).toBe(1);
    expect(snapshot).toBeDefined();

    unsubscribe();
  });

  it('should start and stop timer correctly', () => {
    engine.start();
    expect(engine.getIsRunning()).toBe(true);

    engine.stop();
    expect(engine.getIsRunning()).toBe(false);
  });
});
