import React, { useState, useEffect } from 'react';
import type { DoorState } from '../../model/types';

interface ElevatorDoorProps {
  doorState: DoorState;
}

export const ElevatorDoor: React.FC<ElevatorDoorProps> = ({ doorState }) => {
  // If mounted while OPENING (e.g. cabin just arrived at this floor),
  // start in 'CLOSED' state so the browser paints the closed leaves,
  // then transition to doorState on the next animation frame so CSS transition plays smoothly.
  const [visualDoorState, setVisualDoorState] = useState<DoorState>(() => {
    if (doorState === 'OPENING') {
      return 'CLOSED';
    }
    return doorState;
  });

  useEffect(() => {
    if (visualDoorState !== doorState) {
      const frameId = requestAnimationFrame(() => {
        setVisualDoorState(doorState);
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [doorState, visualDoorState]);

  return (
    <div className={`door-container ${visualDoorState}`} title={`Door: ${doorState}`}>
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
