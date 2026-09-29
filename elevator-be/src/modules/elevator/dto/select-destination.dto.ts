import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ELEVATOR_CONSTANTS } from '../../../domain/constants/elevator.constants';
import { SYSTEM_MESSAGES } from '../../../domain/constants/messages.constants';

export class SelectDestinationDto {
  @ApiProperty({
    description: 'Target floor number to travel to from inside cabin',
    minimum: ELEVATOR_CONSTANTS.MIN_FLOOR,
    maximum: ELEVATOR_CONSTANTS.MAX_FLOOR,
    example: 8,
  })
  @IsInt({ message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_INTEGER })
  @Min(ELEVATOR_CONSTANTS.MIN_FLOOR, { message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_MIN(ELEVATOR_CONSTANTS.MIN_FLOOR) })
  @Max(ELEVATOR_CONSTANTS.MAX_FLOOR, { message: SYSTEM_MESSAGES.ERROR.VALIDATION_FLOOR_MAX(ELEVATOR_CONSTANTS.MAX_FLOOR) })
  floor: number;
}
