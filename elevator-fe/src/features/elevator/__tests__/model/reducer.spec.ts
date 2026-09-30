import { describe, it, expect } from 'vitest';
import { elevatorReducer } from '../../model/reducer';
import { initialElevatorState } from '../../model/state';
import type { SystemSnapshot, SimulationTickPayload } from '../../model/types';

describe('elevatorReducer', () => {
  it('should initialize with 3 elevators at floor 1 in IDLE state', () => {
    expect(initialElevatorState.elevators[1].currentFloor).toBe(1);
    expect(initialElevatorState.elevators[2].currentFloor).toBe(1);
    expect(initialElevatorState.elevators[3].currentFloor).toBe(1);
    expect(initialElevatorState.elevators[1].state).toBe('IDLE');
    expect(initialElevatorState.elevators[1].doorState).toBe('CLOSED');
  });

  it('should handle SET_CONNECTED', () => {
    const nextState = elevatorReducer(initialElevatorState, {
      type: 'SET_CONNECTED',
      payload: true,
    });
    expect(nextState.connected).toBe(true);
    expect(nextState.logs[0].message).toContain('Real-time WebSocket connection established');
  });

  it('should handle SYNC_SNAPSHOT and update elevators & activeHallCalls', () => {
    const mockSnapshot: SystemSnapshot = {
      timestamp: 1700000000000,
      elevators: [
        {
          id: 1,
          currentFloor: 5,
          direction: 'UP',
          state: 'MOVING_UP',
          doorState: 'CLOSED',
          destinationRequests: [8, 10],
          hallRequests: [{ floor: 6, direction: 'UP' }],
        },
        {
          id: 2,
          currentFloor: 2,
          direction: 'IDLE',
          state: 'IDLE',
          doorState: 'CLOSED',
          destinationRequests: [],
          hallRequests: [],
        },
        {
          id: 3,
          currentFloor: 9,
          direction: 'DOWN',
          state: 'MOVING_DOWN',
          doorState: 'CLOSED',
          destinationRequests: [1],
          hallRequests: [{ floor: 4, direction: 'DOWN' }],
        },
      ],
    };

    const nextState = elevatorReducer(initialElevatorState, {
      type: 'SYNC_SNAPSHOT',
      payload: mockSnapshot,
    });

    expect(nextState.elevators[1].currentFloor).toBe(5);
    expect(nextState.elevators[1].destinationRequests).toEqual([8, 10]);
    expect(nextState.elevators[3].currentFloor).toBe(9);
    expect(nextState.activeHallCalls['6_UP']).toBe(true);
    expect(nextState.activeHallCalls['4_DOWN']).toBe(true);
  });

  it('should handle HANDLE_TICK with simulation events and update logs', () => {
    const tickPayload: SimulationTickPayload = {
      snapshot: {
        timestamp: 1700000001000,
        elevators: [
          {
            id: 1,
            currentFloor: 6,
            direction: 'UP',
            state: 'DOOR_OPENING',
            doorState: 'OPENING',
            destinationRequests: [8],
            hallRequests: [],
          },
          {
            id: 2,
            currentFloor: 2,
            direction: 'IDLE',
            state: 'IDLE',
            doorState: 'CLOSED',
            destinationRequests: [],
            hallRequests: [],
          },
          {
            id: 3,
            currentFloor: 8,
            direction: 'DOWN',
            state: 'MOVING_DOWN',
            doorState: 'CLOSED',
            destinationRequests: [1],
            hallRequests: [],
          },
        ],
      },
      events: [
        {
          type: 'ELEVATOR_MOVED',
          elevatorId: 1,
          fromFloor: 5,
          toFloor: 6,
          direction: 'UP',
          timestamp: 1700000001000,
        },
        {
          type: 'DOOR_STATE_CHANGED',
          elevatorId: 1,
          doorState: 'OPENING',
          floor: 6,
          timestamp: 1700000001000,
        },
      ],
    };

    const nextState = elevatorReducer(initialElevatorState, {
      type: 'HANDLE_TICK',
      payload: tickPayload,
    });

    expect(nextState.elevators[1].currentFloor).toBe(6);
    expect(nextState.elevators[1].doorState).toBe('OPENING');
    expect(nextState.logs.length).toBeGreaterThan(1);
    expect(nextState.logs[0].message).toContain('Elevator 1 moved from Floor 5 to Floor 6');
  });

  it('should handle SET_SELECTED_ELEVATOR', () => {
    const nextState = elevatorReducer(initialElevatorState, {
      type: 'SET_SELECTED_ELEVATOR',
      payload: 3,
    });
    expect(nextState.selectedElevatorId).toBe(3);
  });

  it('should handle SET_ERROR and CLEAR_ERROR', () => {
    const stateWithError = elevatorReducer(initialElevatorState, {
      type: 'SET_ERROR',
      payload: 'Network connection failed',
    });
    expect(stateWithError.error).toBe('Network connection failed');
    expect(stateWithError.logs[0].type).toBe('ERROR');

    const clearedState = elevatorReducer(stateWithError, {
      type: 'CLEAR_ERROR',
    });
    expect(clearedState.error).toBeNull();
  });
});
