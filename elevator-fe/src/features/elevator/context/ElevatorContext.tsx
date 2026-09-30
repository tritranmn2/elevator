import React, {
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { elevatorReducer } from '../model/reducer';
import { initialElevatorState } from '../model/state';
import { elevatorApi } from '../api/elevator.api';
import { elevatorSocketClient } from '../websocket/elevator.socket';
import { ElevatorContext } from './ElevatorContextDefinition';
import type { Direction } from '../model/types';

export const ElevatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(elevatorReducer, initialElevatorState);

  useEffect(() => {
    elevatorApi
      .getSystemSnapshot()
      .then((snapshot) => {
        dispatch({ type: 'SYNC_SNAPSHOT', payload: snapshot });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Initial snapshot fetch warning:', msg);
      });

    elevatorSocketClient.connect({
      onConnect: () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
      },
      onDisconnect: () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
      },
      onSnapshot: (snapshot) => {
        dispatch({ type: 'SYNC_SNAPSHOT', payload: snapshot });
      },
      onTick: (payload) => {
        dispatch({ type: 'HANDLE_TICK', payload });
      },
      onElevatorArrived: (event) => {
        dispatch({ type: 'ELEVATOR_ARRIVED', payload: event });
      },
      onDoorStateChanged: (event) => {
        dispatch({ type: 'DOOR_STATE_CHANGED', payload: event });
      },
    });

    return () => {
      elevatorSocketClient.disconnect();
    };
  }, []);

  const refreshSnapshot = useCallback(async () => {
    try {
      const snapshot = await elevatorApi.getSystemSnapshot();
      dispatch({ type: 'SYNC_SNAPSHOT', payload: snapshot });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh snapshot';
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, []);

  const callElevator = useCallback(
    async (floor: number, direction: Direction) => {
      try {
        dispatch({
          type: 'SET_HALL_CALL_ACTIVE',
          payload: { floor, direction, active: true },
        });
        dispatch({
          type: 'ADD_LOG',
          payload: {
            timestamp: Date.now(),
            type: 'ACTION',
            message: `User pressed Hall Call at Floor ${floor} (${direction})`,
          },
        });

        await elevatorApi.callElevator(floor, direction);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to call elevator';
        dispatch({
          type: 'SET_HALL_CALL_ACTIVE',
          payload: { floor, direction, active: false },
        });
        dispatch({ type: 'SET_ERROR', payload: msg });
      }
    },
    [],
  );

  const selectDestination = useCallback(
    async (elevatorId: number, floor: number) => {
      try {
        dispatch({
          type: 'ADD_LOG',
          payload: {
            timestamp: Date.now(),
            elevatorId,
            type: 'ACTION',
            message: `User pressed Destination Floor ${floor} in Elevator ${elevatorId}`,
          },
        });

        await elevatorApi.selectDestination(elevatorId, floor);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to select destination';
        dispatch({ type: 'SET_ERROR', payload: msg });
      }
    },
    [],
  );

  const pressOpenDoor = useCallback(async (elevatorId: number) => {
    try {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          timestamp: Date.now(),
          elevatorId,
          type: 'ACTION',
          message: `User pressed Open Door (<|>) on Elevator ${elevatorId}`,
        },
      });

      await elevatorApi.pressOpenDoor(elevatorId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to open door';
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, []);

  const pressCloseDoor = useCallback(async (elevatorId: number) => {
    try {
      dispatch({
        type: 'ADD_LOG',
        payload: {
          timestamp: Date.now(),
          elevatorId,
          type: 'ACTION',
          message: `User pressed Close Door (>|<) on Elevator ${elevatorId}`,
        },
      });

      await elevatorApi.pressCloseDoor(elevatorId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to close door';
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, []);

  const setSelectedElevatorId = useCallback((id: number) => {
    dispatch({ type: 'SET_SELECTED_ELEVATOR', payload: id });
  }, []);

  return (
    <ElevatorContext.Provider
      value={{
        state,
        dispatch,
        callElevator,
        selectDestination,
        pressOpenDoor,
        pressCloseDoor,
        setSelectedElevatorId,
        refreshSnapshot,
      }}
    >
      {children}
    </ElevatorContext.Provider>
  );
};
