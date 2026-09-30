import { createContext } from 'react';
import type React from 'react';
import type { ElevatorFeatureState } from '../model/state';
import type { ElevatorAction } from '../model/actions';
import type { Direction } from '../model/types';

export interface ElevatorContextValue {
  state: ElevatorFeatureState;
  dispatch: React.Dispatch<ElevatorAction>;
  callElevator: (floor: number, direction: Direction) => Promise<void>;
  selectDestination: (elevatorId: number, floor: number) => Promise<void>;
  pressOpenDoor: (elevatorId: number) => Promise<void>;
  pressCloseDoor: (elevatorId: number) => Promise<void>;
  setSelectedElevatorId: (id: number) => void;
  refreshSnapshot: () => Promise<void>;
}

export const ElevatorContext = createContext<ElevatorContextValue | undefined>(undefined);
