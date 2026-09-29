import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ElevatorService } from './elevator.service';
import { CallElevatorDto } from './dto/call-elevator.dto';
import { SelectDestinationDto } from './dto/select-destination.dto';
import { API_ROUTES } from '../../domain/constants/api-routes.constants';

@ApiTags('Elevators')
@Controller(API_ROUTES.ELEVATORS.ROOT)
export class ElevatorController {
  constructor(private readonly elevatorService: ElevatorService) {}

  @Get()
  @ApiOperation({
    summary: 'Get system snapshot',
    description: 'Retrieves current real-time state of all 3 elevators including positions, directions, door status and pending requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current system snapshot retrieved successfully.',
  })
  getSystemSnapshot() {
    return this.elevatorService.getSystemSnapshot();
  }

  @Post(API_ROUTES.ELEVATORS.CALL)
  @ApiOperation({
    summary: 'Call elevator from hall (Hall Call)',
    description: 'Requests an elevator from a specific floor with a travel direction (UP or DOWN). Automatically assigned to optimal elevator via Strategy Pattern.',
  })
  @ApiBody({ type: CallElevatorDto })
  @ApiResponse({
    status: 201,
    description: 'Elevator called and assigned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid floor boundary or invalid direction for boundary floors.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  callElevator(@Body() dto: CallElevatorDto) {
    return this.elevatorService.callElevator(dto);
  }

  @Post(API_ROUTES.ELEVATORS.DESTINATION)
  @ApiOperation({
    summary: 'Select destination floor from cabin (Car Call)',
    description: 'Presses a destination floor button inside the specified elevator cabin.',
  })
  @ApiParam({
    name: 'id',
    description: 'Elevator ID (1, 2, or 3)',
    example: 1,
  })
  @ApiBody({ type: SelectDestinationDto })
  @ApiResponse({
    status: 201,
    description: 'Destination floor registered in elevator cabin queue.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid destination floor.',
  })
  @ApiResponse({
    status: 404,
    description: 'Elevator ID not found.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  selectDestination(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SelectDestinationDto,
  ) {
    return this.elevatorService.selectDestination(id, dto);
  }

  @Post(API_ROUTES.ELEVATORS.DOOR_OPEN)
  @ApiOperation({
    summary: 'Press Open Door button',
    description: 'Keeps or resets the door dwell timer open when stopped at a floor. Reverses closing door back to opening.',
  })
  @ApiParam({
    name: 'id',
    description: 'Elevator ID (1, 2, or 3)',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Door open command processed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Elevator ID not found.',
  })
  pressOpenDoor(@Param('id', ParseIntPipe) id: number) {
    return this.elevatorService.pressOpenDoor(id);
  }

  @Post(API_ROUTES.ELEVATORS.DOOR_CLOSE)
  @ApiOperation({
    summary: 'Press Close Door button',
    description: 'Immediately triggers door closing if currently open without waiting for dwell timer expiration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Elevator ID (1, 2, or 3)',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Door close command processed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Elevator ID not found.',
  })
  pressCloseDoor(@Param('id', ParseIntPipe) id: number) {
    return this.elevatorService.pressCloseDoor(id);
  }
}
