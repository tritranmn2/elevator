import React from 'react';
import { Building2, Layers } from 'lucide-react';
import { FloorRow } from './FloorRow';
import { useElevator } from '../../hooks/useElevator';
import { selectElevatorList, selectFloorList } from '../../model/selectors';

export const Building: React.FC = () => {
  const { state } = useElevator();
  const elevators = selectElevatorList(state);
  const floors = selectFloorList(10);

  return (
    <div className="glass-panel building-section">
      <div className="building-header">
        <div className="building-title">
          <Building2 size={20} color="var(--accent-cyan)" />
          <span>Building Visualization ({floors.length} Floors)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Layers size={16} />
          <span>{elevators.length} Shafts with Per-Floor Controls</span>
        </div>
      </div>

      <div className="building-grid">
        <div className="shaft-columns-header">
          <div>FLOOR</div>
          {elevators.map((elv) => (
            <div key={elv.id} className="shaft-col-label">
              <span>ELEVATOR {elv.id}</span>
            </div>
          ))}
        </div>

        {floors.map((floor) => (
          <FloorRow key={floor} floor={floor} />
        ))}
      </div>
    </div>
  );
};

