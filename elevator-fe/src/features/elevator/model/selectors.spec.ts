import { describe, it, expect } from 'vitest';
import {
  selectElevatorList,
  selectElevatorById,
  selectIsHallCallActive,
  selectIsFloorInDestination,
} from './selectors';
import { initialElevatorState } from './state';
import type { ElevatorFeatureState } from './state';

describe('elevatorSelectors', () => {
  const mockState: ElevatorFeatureState = {
    ...initialElevatorState,
    elevators: {
      1: {
        id: 1,
        currentFloor: 3,
        direction: 'UP',
        state: 'MOVING_UP',
        doorState: 'CLOSED',
        destinationRequests: [5, 9],
        hallRequests: [{ floor: 4, direction: 'UP' }],
      },
      2: {
        id: 2,
        currentFloor: 1,
        direction: 'IDLE',
        state: 'IDLE',
        doorState: 'CLOSED',
        destinationRequests: [],
        hallRequests: [],
      },
      3: {
        id: 3,
        currentFloor: 10,
        direction: 'DOWN',
        state: 'MOVING_DOWN',
        doorState: 'CLOSED',
        destinationRequests: [2],
        hallRequests: [{ floor: 7, direction: 'DOWN' }],
      },
    },
    activeHallCalls: {
      '4_UP': true,
      '7_DOWN': true,
    },
  };

  it('selectElevatorList returns sorted array of elevators', () => {
    const list = selectElevatorList(mockState);
    expect(list.length).toBe(3);
    expect(list[0].id).toBe(1);
    expect(list[1].id).toBe(2);
    expect(list[2].id).toBe(3);
  });

  it('selectElevatorById returns the correct elevator', () => {
    const elv = selectElevatorById(mockState, 3);
    expect(elv?.currentFloor).toBe(10);
    expect(elv?.direction).toBe('DOWN');
  });

  it('selectIsHallCallActive detects active hall calls correctly', () => {
    expect(selectIsHallCallActive(mockState, 4, 'UP')).toBe(true);
    expect(selectIsHallCallActive(mockState, 7, 'DOWN')).toBe(true);
    expect(selectIsHallCallActive(mockState, 2, 'UP')).toBe(false);
  });

  it('selectIsFloorInDestination returns true if floor is in destination queue', () => {
    expect(selectIsFloorInDestination(mockState, 1, 5)).toBe(true);
    expect(selectIsFloorInDestination(mockState, 1, 9)).toBe(true);
    expect(selectIsFloorInDestination(mockState, 1, 4)).toBe(false);
    expect(selectIsFloorInDestination(mockState, 3, 2)).toBe(true);
  });
});
