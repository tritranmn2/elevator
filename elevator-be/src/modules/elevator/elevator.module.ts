import { Module } from '@nestjs/common';
import { ElevatorController } from './elevator.controller';
import { ElevatorService } from './elevator.service';
import { ElevatorGateway } from './elevator.gateway';
import { ElevatorSystem } from '../../domain/elevator-system';
import { SimulationEngine } from '../../simulation/simulation.engine';

@Module({
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
  exports: [ElevatorService, ElevatorGateway, ElevatorSystem, SimulationEngine],
})
export class ElevatorModule {}
