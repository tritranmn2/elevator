import { useContext } from 'react';
import { ElevatorContext } from '../context/ElevatorContextDefinition';
import type { ElevatorContextValue } from '../context/ElevatorContextDefinition';

export const useElevator = (): ElevatorContextValue => {
  const context = useContext(ElevatorContext);
  if (!context) {
    throw new Error('useElevator must be used within an ElevatorProvider');
  }
  return context;
};
