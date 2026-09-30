import React from 'react';
import { Building2, Layers } from 'lucide-react';
import { FloorRow } from './FloorRow';
import { ELEVATOR_CONSTANTS } from '../../constants';

export const Building: React.FC = () => {
  return (
    <div className="glass-panel building-section">
      <div className="building-header">
        <div className="building-title">
          <Building2 size={20} color="var(--accent-cyan)" />
          <span>Building Visualization (10 Floors)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Layers size={16} />
          <span>3 Parallel Shafts</span>
        </div>
      </div>

      <div className="building-grid">
        <div className="shaft-columns-header">
          <div>FLOOR</div>
          <div className="shaft-col-label">
            <span>ELEVATOR 1</span>
          </div>
          <div className="shaft-col-label">
            <span>ELEVATOR 2</span>
          </div>
          <div className="shaft-col-label">
            <span>ELEVATOR 3</span>
          </div>
          <div>HALL CALL</div>
        </div>

        {ELEVATOR_CONSTANTS.FLOOR_LIST.map((floor) => (
          <FloorRow key={floor} floor={floor} />
        ))}
      </div>
    </div>
  );
};
