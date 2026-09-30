import React from 'react';
import { FloorNumber } from './FloorNumber';
import { HallCallButtons } from './HallCallButtons';
import { ElevatorCabin } from '../Elevator/ElevatorCabin';
import { useElevator } from '../../hooks/useElevator';
import { ELEVATOR_CONSTANTS } from '../../constants';

interface FloorRowProps {
  floor: number;
}

export const FloorRow: React.FC<FloorRowProps> = ({ floor }) => {
  const { state } = useElevator();

  return (
    <div className="floor-row" data-testid={`floor-row-${floor}`}>
      <FloorNumber floor={floor} />

      {ELEVATOR_CONSTANTS.ELEVATOR_IDS.map((elevatorId) => {
        const elevator = state.elevators[elevatorId];
        const isHere = elevator && elevator.currentFloor === floor;

        return (
          <div
            key={elevatorId}
            className="shaft-cell"
            data-testid={`shaft-${elevatorId}-floor-${floor}`}
          >
            {isHere && <ElevatorCabin elevator={elevator} />}
          </div>
        );
      })}

      <HallCallButtons floor={floor} />
    </div>
  );
};
