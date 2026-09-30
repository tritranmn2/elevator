import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorController } from './elevator.controller';
import { ElevatorService } from './elevator.service';
import { ElevatorSystem } from '../../domain/elevator-system';
import { SimulationEngine } from '../../simulation/simulation.engine';
import { ElevatorGateway } from './elevator.gateway';
import { Direction } from '../../domain/enums/direction.enum';

describe('ElevatorController', () => {
  let controller: ElevatorController;
  let service: ElevatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElevatorController],
      providers: [
        {
          provide: ElevatorSystem,
          useFactory: () => new ElevatorSystem(3),
        },
        SimulationEngine,
        ElevatorGateway,
        ElevatorService,
      ],
    }).compile();

    controller = module.get<ElevatorController>(ElevatorController);
    service = module.get<ElevatorService>(ElevatorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return system snapshot on GET /api/elevators', () => {
    const snapshot = controller.getSystemSnapshot();
    expect(snapshot.elevators.length).toBe(3);
  });

  it('should accept valid hall call on POST /api/elevators/call and return concise payload', () => {
    const res = controller.callElevator({ floor: 5, direction: Direction.UP });
    expect(res.assignedElevatorId).toBeDefined();
    expect(res.floor).toBe(5);
    expect(res.direction).toBe(Direction.UP);
  });

  it('should accept destination selection on POST /api/elevators/:id/destination and return concise payload', () => {
    const res = controller.selectDestination(1, { floor: 8 });
    expect(res.elevatorId).toBe(1);
    expect(res.floor).toBe(8);
  });

  it('should control door on POST open & close', () => {
    const openRes = controller.pressOpenDoor(1);
    expect(openRes.elevatorId).toBe(1);
    expect(openRes.doorState).toBeDefined();

    const closeRes = controller.pressCloseDoor(1);
    expect(closeRes.elevatorId).toBe(1);
    expect(closeRes.doorState).toBeDefined();
  });
});
