import type { ElevatorFeatureState } from './state';
import type { Direction, DoorState, ElevatorSnapshot, ElevatorState } from './types';

export const selectElevatorList = (state: ElevatorFeatureState): ElevatorSnapshot[] => {
  return Object.values(state.elevators).sort((a, b) => a.id - b.id);
};

export const selectElevatorById = (
  state: ElevatorFeatureState,
  id: number,
): ElevatorSnapshot | undefined => {
  return state.elevators[id];
};

export const selectSelectedElevator = (state: ElevatorFeatureState): ElevatorSnapshot => {
  return state.elevators[state.selectedElevatorId] || state.elevators[1];
};

export const selectIsHallCallActive = (
  state: ElevatorFeatureState,
  floor: number,
  direction: Direction,
): boolean => {
  const key = `${floor}_${direction}`;
  if (state.activeHallCalls[key]) return true;

  // Check across all elevators' hallRequests
  return Object.values(state.elevators).some((elv) =>
    elv.hallRequests.some((req) => req.floor === floor && req.direction === direction),
  );
};

export const selectIsFloorInDestination = (
  state: ElevatorFeatureState,
  elevatorId: number,
  floor: number,
): boolean => {
  const elv = state.elevators[elevatorId];
  if (!elv) return false;
  return elv.destinationRequests.includes(floor);
};

export const selectElevatorDoorState = (
  state: ElevatorFeatureState,
  elevatorId: number,
): DoorState => {
  return state.elevators[elevatorId]?.doorState || 'CLOSED';
};

export const selectElevatorMovementState = (
  state: ElevatorFeatureState,
  elevatorId: number,
): ElevatorState => {
  return state.elevators[elevatorId]?.state || 'IDLE';
};
