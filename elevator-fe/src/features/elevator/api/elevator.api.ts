import { httpClient } from '../../../shared/lib/http';
import { ELEVATOR_CONSTANTS } from '../constants';
import type { Direction, SystemSnapshot } from '../model/types';

export const elevatorApi = {
  async getSystemSnapshot(): Promise<SystemSnapshot> {
    return httpClient.get<unknown, SystemSnapshot>(ELEVATOR_CONSTANTS.API_ROUTES.ELEVATORS);
  },

  async callElevator(floor: number, direction: Direction): Promise<unknown> {
    return httpClient.post(ELEVATOR_CONSTANTS.API_ROUTES.CALL, {
      floor,
      direction,
    });
  },

  async selectDestination(elevatorId: number, floor: number): Promise<unknown> {
    return httpClient.post(ELEVATOR_CONSTANTS.API_ROUTES.DESTINATION(elevatorId), {
      floor,
    });
  },

  async pressOpenDoor(elevatorId: number): Promise<unknown> {
    return httpClient.post(ELEVATOR_CONSTANTS.API_ROUTES.DOOR_OPEN(elevatorId));
  },

  async pressCloseDoor(elevatorId: number): Promise<unknown> {
    return httpClient.post(ELEVATOR_CONSTANTS.API_ROUTES.DOOR_CLOSE(elevatorId));
  },
};
