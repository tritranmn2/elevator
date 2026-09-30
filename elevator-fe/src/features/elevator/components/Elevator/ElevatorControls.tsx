import React from 'react';
import { UnfoldHorizontal, FoldHorizontal } from 'lucide-react';
import { useElevator } from '../../hooks/useElevator';

interface ElevatorControlsProps {
  elevatorId: number;
}

export const ElevatorControls: React.FC<ElevatorControlsProps> = ({ elevatorId }) => {
  const { state, pressOpenDoor, pressCloseDoor } = useElevator();
  const elevator = state.elevators[elevatorId];

  const isMoving = elevator?.state === 'MOVING_UP' || elevator?.state === 'MOVING_DOWN';

  return (
    <div className="door-controls-row">
      <button
        type="button"
        className="btn-door-control"
        onClick={() => pressOpenDoor(elevatorId)}
        disabled={isMoving}
        title="Open Door / Keep Open (<|>)"
        aria-label="Open door"
      >
        <UnfoldHorizontal size={16} />
        <span>Open</span>
      </button>

      <button
        type="button"
        className="btn-door-control"
        onClick={() => pressCloseDoor(elevatorId)}
        disabled={isMoving || elevator?.doorState === 'CLOSED'}
        title="Close Door Immediately (>|<)"
        aria-label="Close door"
      >
        <FoldHorizontal size={16} />
        <span>Close</span>
      </button>
    </div>
  );
};
