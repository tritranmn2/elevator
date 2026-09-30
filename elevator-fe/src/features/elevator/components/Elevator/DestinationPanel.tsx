import React from 'react';
import { useElevator } from '../../hooks/useElevator';
import { ElevatorControls } from './ElevatorControls';
import { selectIsFloorInDestination } from '../../model/selectors';

interface DestinationPanelProps {
  elevatorId: number;
}

export const DestinationPanel: React.FC<DestinationPanelProps> = ({ elevatorId }) => {
  const { state, selectDestination } = useElevator();
  const elevator = state.elevators[elevatorId];

  const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const isDoorOpen = elevator?.doorState === 'OPEN';

  const handleSelectFloor = (floor: number) => {
    selectDestination(elevatorId, floor);
  };

  return (
    <div className="cabin-controls-panel" data-testid={`destination-panel-e${elevatorId}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Cabin Keypad (E{elevatorId})
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: isDoorOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isDoorOpen ? 'var(--status-open)' : 'var(--text-muted)',
          }}
        >
          {isDoorOpen ? 'Door Open (Selectable)' : 'Door Closed'}
        </span>
      </div>

      <div className="keypad-grid">
        {floors.map((floor) => {
          const isTarget = selectIsFloorInDestination(state, elevatorId, floor);
          const isCurrent = elevator?.currentFloor === floor;

          return (
            <button
              key={floor}
              type="button"
              className={`btn-keypad-floor ${isTarget ? 'active-destination' : ''}`}
              onClick={() => handleSelectFloor(floor)}
              title={
                isCurrent
                  ? `Floor ${floor} (Current)`
                  : isTarget
                  ? `Floor ${floor} (Selected)`
                  : `Select Floor ${floor}`
              }
              data-testid={`btn-floor-${elevatorId}-${floor}`}
            >
              {floor}
            </button>
          );
        })}
      </div>

      <ElevatorControls elevatorId={elevatorId} />
    </div>
  );
};
