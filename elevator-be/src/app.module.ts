import { Module } from '@nestjs/common';
import { ElevatorModule } from './modules/elevator/elevator.module';
import { LoggerModule } from './common/loggers/logger.module';

@Module({
  imports: [LoggerModule, ElevatorModule],
})
export class AppModule {}
