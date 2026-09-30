import React from 'react';
import type { DoorState } from '../../model/types';

interface ElevatorDoorProps {
  doorState: DoorState;
}

export const ElevatorDoor: React.FC<ElevatorDoorProps> = ({ doorState }) => {
  return (
    <div className={`door-container ${doorState}`} title={`Door: ${doorState}`}>
      <div className="door-leaf door-leaf-left" />
      <div className="door-leaf door-leaf-right" />
    </div>
  );
};
