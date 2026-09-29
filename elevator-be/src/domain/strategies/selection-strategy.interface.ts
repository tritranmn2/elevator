import { Elevator } from '../entities/elevator';
import { HallRequest } from '../requests/hall-request';

export interface ElevatorSelectionStrategy {
  /**
   * Chọn thang máy phù hợp nhất trong danh sách các thang máy để phục vụ HallRequest
   */
  select(elevators: Elevator[], request: HallRequest): Elevator;
}
