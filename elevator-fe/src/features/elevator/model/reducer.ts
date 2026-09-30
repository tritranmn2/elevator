import type { ElevatorAction } from './actions';
import type { ElevatorFeatureState } from './state';
import type { ElevatorEvent, ElevatorSnapshot, SystemLogEntry } from './types';

const MAX_LOGS = 100;

function formatEventMessage(event: ElevatorEvent): string {
  switch (event.type) {
    case 'ELEVATOR_MOVED':
      return `Elevator ${event.elevatorId} moved from Floor ${event.fromFloor} to Floor ${event.toFloor} (${event.direction})`;
    case 'ELEVATOR_ARRIVED':
      return `Elevator ${event.elevatorId} arrived at Floor ${event.floor} (${event.direction})`;
    case 'DOOR_STATE_CHANGED':
      return `Elevator ${event.elevatorId} door state changed to ${event.doorState} at Floor ${event.floor}`;
    case 'ELEVATOR_STATE_CHANGED':
      return `Elevator ${event.elevatorId} state changed from ${event.oldState} to ${event.newState} at Floor ${event.floor}`;
    case 'REQUEST_COMPLETED':
      return `Elevator ${event.elevatorId} completed request at Floor ${event.floor} (${event.direction})`;
    default:
      return `Elevator event occurred`;
  }
}

function updateHallCallsFromElevators(elevators: Record<number, ElevatorSnapshot>): Record<string, boolean> {
  const activeCalls: Record<string, boolean> = {};
  Object.values(elevators).forEach((elv) => {
    elv.hallRequests.forEach((req) => {
      activeCalls[`${req.floor}_${req.direction}`] = true;
    });
  });
  return activeCalls;
}

export function elevatorReducer(
  state: ElevatorFeatureState,
  action: ElevatorAction,
): ElevatorFeatureState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return {
        ...state,
        connected: action.payload,
        logs: [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type: 'INFO',
            message: action.payload
              ? 'Real-time WebSocket connection established.'
              : 'Real-time WebSocket disconnected. Reconnecting...',
          },
          ...state.logs.slice(0, MAX_LOGS - 1),
        ],
      };

    case 'SYNC_SNAPSHOT': {
      const nextElevators: Record<number, ElevatorSnapshot> = { ...state.elevators };
      action.payload.elevators.forEach((el) => {
        nextElevators[el.id] = el;
      });

      return {
        ...state,
        elevators: nextElevators,
        activeHallCalls: updateHallCallsFromElevators(nextElevators),
        lastUpdated: action.payload.timestamp || Date.now(),
      };
    }

    case 'HANDLE_TICK': {
      const nextElevators: Record<number, ElevatorSnapshot> = { ...state.elevators };
      action.payload.snapshot.elevators.forEach((el) => {
        nextElevators[el.id] = el;
      });

      const newLogEntries: SystemLogEntry[] = action.payload.events.map((evt) => ({
        id: `evt-${evt.timestamp}-${Math.random()}`,
        timestamp: evt.timestamp,
        elevatorId: evt.elevatorId,
        type: 'EVENT',
        message: formatEventMessage(evt),
      }));

      const combinedLogs = [...newLogEntries, ...state.logs].slice(0, MAX_LOGS);

      return {
        ...state,
        elevators: nextElevators,
        activeHallCalls: updateHallCallsFromElevators(nextElevators),
        logs: combinedLogs,
        lastUpdated: action.payload.snapshot.timestamp || Date.now(),
      };
    }

    case 'ELEVATOR_ARRIVED': {
      const elv = state.elevators[action.payload.elevatorId];
      if (!elv) return state;

      const updated = {
        ...elv,
        currentFloor: action.payload.floor,
        direction: action.payload.direction,
      };

      const newLog: SystemLogEntry = {
        id: `arr-${Date.now()}-${Math.random()}`,
        timestamp: action.payload.timestamp || Date.now(),
        elevatorId: action.payload.elevatorId,
        type: 'EVENT',
        message: `Elevator ${action.payload.elevatorId} arrived at Floor ${action.payload.floor}`,
      };

      return {
        ...state,
        elevators: {
          ...state.elevators,
          [action.payload.elevatorId]: updated,
        },
        logs: [newLog, ...state.logs].slice(0, MAX_LOGS),
      };
    }

    case 'DOOR_STATE_CHANGED': {
      const elv = state.elevators[action.payload.elevatorId];
      if (!elv) return state;

      const updated = {
        ...elv,
        doorState: action.payload.doorState,
        currentFloor: action.payload.floor,
      };

      const newLog: SystemLogEntry = {
        id: `door-${Date.now()}-${Math.random()}`,
        timestamp: action.payload.timestamp || Date.now(),
        elevatorId: action.payload.elevatorId,
        type: 'EVENT',
        message: `Elevator ${action.payload.elevatorId} door is now ${action.payload.doorState} at Floor ${action.payload.floor}`,
      };

      return {
        ...state,
        elevators: {
          ...state.elevators,
          [action.payload.elevatorId]: updated,
        },
        logs: [newLog, ...state.logs].slice(0, MAX_LOGS),
      };
    }

    case 'SET_SELECTED_ELEVATOR':
      return {
        ...state,
        selectedElevatorId: action.payload,
      };

    case 'SET_HALL_CALL_ACTIVE': {
      const key = `${action.payload.floor}_${action.payload.direction}`;
      return {
        ...state,
        activeHallCalls: {
          ...state.activeHallCalls,
          [key]: action.payload.active,
        },
      };
    }

    case 'ADD_LOG': {
      const newEntry: SystemLogEntry = {
        ...action.payload,
        id: `log-${Date.now()}-${Math.random()}`,
      };
      return {
        ...state,
        logs: [newEntry, ...state.logs].slice(0, MAX_LOGS),
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        logs: action.payload
          ? [
              {
                id: `err-${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                type: 'ERROR',
                message: `Error: ${action.payload}`,
              },
              ...state.logs.slice(0, MAX_LOGS - 1),
            ]
          : state.logs,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
