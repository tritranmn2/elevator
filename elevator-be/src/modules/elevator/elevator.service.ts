import { Injectable, OnModuleInit, HttpStatus, HttpException } from '@nestjs/common';
import { ElevatorSystem } from '../../domain/elevator-system';
import { SimulationEngine } from '../../simulation/simulation.engine';
import { ElevatorGateway } from './elevator.gateway';
import { CallElevatorDto } from './dto/call-elevator.dto';
import { SelectDestinationDto } from './dto/select-destination.dto';
import { SystemSnapshot } from '../../domain/snapshots/elevator-snapshot';
import { SYSTEM_MESSAGES } from '../../domain/constants/messages.constants';
import { ErrorHttpException } from '../../common/exceptions/custom-http.exception';
import ErrorCode from '../../common/config/error-code.config';

@Injectable()
export class ElevatorService implements OnModuleInit {
  constructor(
    private readonly elevatorSystem: ElevatorSystem,
    private readonly simulationEngine: SimulationEngine,
    private readonly elevatorGateway: ElevatorGateway,
  ) {}

  onModuleInit() {
    // Đăng ký listener để tự động broadcast dữ liệu WebSocket ở mỗi tick
    this.simulationEngine.subscribe((snapshot, events) => {
      this.elevatorGateway.broadcastSystemTick(snapshot, events);
    });
  }

  public getSystemSnapshot(): SystemSnapshot {
    return this.elevatorSystem.getSnapshot();
  }

  public callElevator(dto: CallElevatorDto) {
    try {
      const result = this.elevatorSystem.callElevator(dto.floor, dto.direction);
      return {
        assignedElevatorId: result.assignedElevatorId,
        floor: dto.floor,
        direction: dto.direction,
      };
    } catch (err: any) {
      if (err.message === SYSTEM_MESSAGES.ERROR.CANNOT_CALL_UP_HIGHEST) {
        throw ErrorHttpException(HttpStatus.BAD_REQUEST, ErrorCode.CANNOT_CALL_UP_HIGHEST);
      }
      if (err.message === SYSTEM_MESSAGES.ERROR.CANNOT_CALL_DOWN_LOWEST) {
        throw ErrorHttpException(HttpStatus.BAD_REQUEST, ErrorCode.CANNOT_CALL_DOWN_LOWEST);
      }
      throw ErrorHttpException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_FLOOR_RANGE);
    }
  }

  public selectDestination(elevatorId: number, dto: SelectDestinationDto) {
    try {
      const elevator = this.elevatorSystem.getElevatorById(elevatorId);
      if (!elevator) {
        throw ErrorHttpException(HttpStatus.NOT_FOUND, ErrorCode.ELEVATOR_NOT_FOUND);
      }
      this.elevatorSystem.selectDestination(elevatorId, dto.floor);
      return {
        elevatorId,
        floor: dto.floor,
      };
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw ErrorHttpException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_FLOOR_RANGE);
    }
  }

  public pressOpenDoor(elevatorId: number) {
    const elevator = this.elevatorSystem.getElevatorById(elevatorId);
    if (!elevator) {
      throw ErrorHttpException(HttpStatus.NOT_FOUND, ErrorCode.ELEVATOR_NOT_FOUND);
    }
    const isAccepted = this.elevatorSystem.pressOpenDoor(elevatorId);
    if (!isAccepted) {
      throw ErrorHttpException(HttpStatus.BAD_REQUEST, ErrorCode.DOOR_CANNOT_OPEN_MOVING);
    }
    return {
      elevatorId,
      doorState: elevator.getDoorState(),
    };
  }

  public pressCloseDoor(elevatorId: number) {
    const elevator = this.elevatorSystem.getElevatorById(elevatorId);
    if (!elevator) {
      throw ErrorHttpException(HttpStatus.NOT_FOUND, ErrorCode.ELEVATOR_NOT_FOUND);
    }
    const isAccepted = this.elevatorSystem.pressCloseDoor(elevatorId);
    return {
      elevatorId,
      doorState: elevator.getDoorState(),
      isAccepted,
    };
  }
}
