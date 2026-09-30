import React from 'react';
import type { DoorState } from '../../model/types';

interface ElevatorDoorProps {
  doorState: DoorState;
}

export const ElevatorDoor: React.FC<ElevatorDoorProps> = ({ doorState }) => {
  return (
    <div className={`door-container ${doorState}`} title={`Door: ${doorState}`}>
      {/* Interior cabin light visible when doors slide open */}
      <div className="door-interior">
        <div className="door-interior-light" />
      </div>

      {/* Left and Right sliding metal door leaves */}
      <div className="door-leaf door-leaf-left">
        <div className="door-leaf-groove" />
      </div>
      <div className="door-leaf door-leaf-right">
        <div className="door-leaf-groove" />
      </div>
    </div>
  );
};
