import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ElevatorContext, type ElevatorContextValue } from '../features/elevator/context/ElevatorContextDefinition';
import { initialElevatorState, type ElevatorFeatureState } from '../features/elevator/model/state';
import { vi } from 'vitest';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<ElevatorFeatureState>;
  contextOverrides?: Partial<ElevatorContextValue>;
}

export function renderWithContext(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  const state: ElevatorFeatureState = {
    ...initialElevatorState,
    ...(options?.initialState ?? {}),
  };

  const contextValue: ElevatorContextValue = {
    state,
    dispatch: vi.fn(),
    callElevator: vi.fn().mockResolvedValue(undefined),
    selectDestination: vi.fn().mockResolvedValue(undefined),
    pressOpenDoor: vi.fn().mockResolvedValue(undefined),
    pressCloseDoor: vi.fn().mockResolvedValue(undefined),
    setSelectedElevatorId: vi.fn(),
    refreshSnapshot: vi.fn().mockResolvedValue(undefined),
    ...(options?.contextOverrides ?? {}),
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ElevatorContext.Provider value={contextValue}>
      {children}
    </ElevatorContext.Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    contextValue,
  };
}
