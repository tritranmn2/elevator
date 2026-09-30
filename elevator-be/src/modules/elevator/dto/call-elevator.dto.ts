import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Direction } from '../../../domain/enums/direction.enum';
import { ELEVATOR_CONSTANTS } from '../../../domain/constants/elevator.constants';
import { SYSTEM_MESSAGES } from '../../../domain/constants/messages.constants';

export class CallElevatorDto {
  @ApiProperty({
    description: 'Floor number where passenger is calling the elevator',
    minimum: ELEVATOR_CONSTANTS.MIN_FLOOR,
    maximum: ELEVATOR_CONSTANTS.MAX_FLOOR,
    example: 5,
  })
  @IsInt({ message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_INTEGER })
  @Min(ELEVATOR_CONSTANTS.MIN_FLOOR, { message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_MIN(ELEVATOR_CONSTANTS.MIN_FLOOR) })
  @Max(ELEVATOR_CONSTANTS.MAX_FLOOR, { message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_MAX(ELEVATOR_CONSTANTS.MAX_FLOOR) })
  floor: number;

  @ApiProperty({
    description: 'Intended travel direction (UP or DOWN)',
    enum: Direction,
    enumName: 'Direction',
    example: Direction.UP,
  })
  @IsEnum(Direction, { message: SYSTEM_MESSAGES.ERROR.VALIDATION_DIRECTION_ENUM })
  direction: Direction;
}
