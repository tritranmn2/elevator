import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElevatorModule } from './modules/elevator/elevator.module';
import { LoggerModule } from './common/loggers/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    LoggerModule,
    ElevatorModule,
  ],
})
export class AppModule {}
