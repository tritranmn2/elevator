import React, { useState, useEffect } from 'react';
import type { ElevatorSnapshot } from '../../model/types';
import { ElevatorDoor } from './ElevatorDoor';
import { useElevator } from '../../hooks/useElevator';

interface ElevatorCabinProps {
  elevator: ElevatorSnapshot;
}

export const ElevatorCabin: React.FC<ElevatorCabinProps> = ({ elevator }) => {
  const { state, setSelectedElevatorId } = useElevator();
  const isSelected = state.selectedElevatorId === elevator.id;
  const isDoorOpen = elevator.doorState === 'OPEN' || elevator.doorState === 'OPENING';

  // Smooth glow transition when cabin mounts at a floor with opening doors
  const [visualDoorOpen, setVisualDoorOpen] = useState<boolean>(() => {
    if (elevator.doorState === 'OPENING') {
      return false;
    }
    return isDoorOpen;
  });

  useEffect(() => {
    if (visualDoorOpen !== isDoorOpen) {
      const frameId = requestAnimationFrame(() => {
        setVisualDoorOpen(isDoorOpen);
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isDoorOpen, visualDoorOpen]);

  const renderDirectionSymbol = () => {
    if (elevator.direction === 'UP') return '↑';
    if (elevator.direction === 'DOWN') return '↓';
    return '—';
  };

  return (
    <div
      className={`elevator-cabin ${isSelected ? 'active-selected' : ''} ${
        visualDoorOpen ? 'door-open-green' : ''
      }`}
      onClick={() => setSelectedElevatorId(elevator.id)}
      title={`Elevator ${elevator.id} (Floor ${elevator.currentFloor}, Door ${elevator.doorState}, State ${elevator.state})`}
      data-testid={`elevator-cabin-${elevator.id}`}
    >
      <div className="cabin-display">
        <span className="cabin-id-tag">E{elevator.id}</span>
        <span className={`direction-indicator ${elevator.direction}`}>
          {renderDirectionSymbol()}
        </span>
      </div>

      <ElevatorDoor doorState={elevator.doorState} />
    </div>
  );
};
