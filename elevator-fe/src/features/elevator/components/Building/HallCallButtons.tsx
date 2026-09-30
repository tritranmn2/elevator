import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useElevator } from '../../hooks/useElevator';
import { selectIsHallCallActive } from '../../model/selectors';

interface HallCallButtonsProps {
  floor: number;
}

export const HallCallButtons: React.FC<HallCallButtonsProps> = ({ floor }) => {
  const { state, callElevator } = useElevator();

  const isUpActive = selectIsHallCallActive(state, floor, 'UP');
  const isDownActive = selectIsHallCallActive(state, floor, 'DOWN');

  const canGoUp = floor < 10;
  const canGoDown = floor > 1;

  const handleCallUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoUp) {
      callElevator(floor, 'UP');
    }
  };

  const handleCallDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoDown) {
      callElevator(floor, 'DOWN');
    }
  };

  return (
    <div className="hall-call-cell" data-testid={`hall-call-floor-${floor}`}>
      {canGoUp ? (
        <button
          type="button"
          className={`btn-hall-call ${isUpActive ? 'active-call-up' : ''}`}
          onClick={handleCallUp}
          title={`Call UP at Floor ${floor}`}
          aria-label={`Call elevator UP at floor ${floor}`}
        >
          <ArrowUp size={16} />
        </button>
      ) : (
        <button type="button" className="btn-hall-call" disabled aria-hidden="true">
          <ArrowUp size={16} />
        </button>
      )}

      {canGoDown ? (
        <button
          type="button"
          className={`btn-hall-call ${isDownActive ? 'active-call-down' : ''}`}
          onClick={handleCallDown}
          title={`Call DOWN at Floor ${floor}`}
          aria-label={`Call elevator DOWN at floor ${floor}`}
        >
          <ArrowDown size={16} />
        </button>
      ) : (
        <button type="button" className="btn-hall-call" disabled aria-hidden="true">
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
};
