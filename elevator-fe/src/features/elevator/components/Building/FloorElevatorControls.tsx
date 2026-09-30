import React from 'react';
import { ArrowUp, ArrowDown, UnfoldHorizontal, FoldHorizontal } from 'lucide-react';
import { useElevator } from '../../hooks/useElevator';
import { selectIsHallCallActive } from '../../model/selectors';

interface FloorControlsProps {
  floor: number;
  elevatorId: number;
}

/**
 * Nút bấm gọi thang Lên / Xuống (Nằm bên TRÁI cửa thang máy)
 */
export const FloorCallButtons: React.FC<FloorControlsProps> = ({ floor, elevatorId }) => {
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
    <div className="floor-call-group" data-testid={`floor-calls-e${elevatorId}-f${floor}`}>
      {/* Vị trí 1: Nút Lên (tầng 10 placeholder để giữ thẳng cột) */}
      {canGoUp ? (
        <button
          type="button"
          className={`btn-mini-control ${isUpActive ? 'active-yellow' : ''}`}
          onClick={handleCallUp}
          title={`E${elevatorId} - Floor ${floor}: Call UP`}
          aria-label={`Call UP at floor ${floor}`}
        >
          <ArrowUp size={13} />
        </button>
      ) : (
        <div className="btn-mini-control-placeholder" aria-hidden="true" />
      )}

      {/* Vị trí 2: Nút Xuống (tầng 1 placeholder để giữ thẳng cột) */}
      {canGoDown ? (
        <button
          type="button"
          className={`btn-mini-control ${isDownActive ? 'active-yellow' : ''}`}
          onClick={handleCallDown}
          title={`E${elevatorId} - Floor ${floor}: Call DOWN`}
          aria-label={`Call DOWN at floor ${floor}`}
        >
          <ArrowDown size={13} />
        </button>
      ) : (
        <div className="btn-mini-control-placeholder" aria-hidden="true" />
      )}
    </div>
  );
};

/**
 * Đèn báo trạng thái Mở / Đóng cửa (Nằm bên PHẢI cửa thang máy, chỉ phát sáng hiển thị trạng thái)
 */
export const FloorDoorIndicators: React.FC<FloorControlsProps> = ({ floor, elevatorId }) => {
  const { state } = useElevator();
  const elevator = state.elevators[elevatorId];

  const isAtThisFloor = elevator && elevator.currentFloor === floor;
  const isDoorOpen = isAtThisFloor && (elevator.doorState === 'OPEN' || elevator.doorState === 'OPENING');
  const isDoorClosing = isAtThisFloor && elevator.doorState === 'CLOSING';

  return (
    <div
      className="floor-door-indicators-group"
      data-testid={`floor-door-ind-e${elevatorId}-f${floor}`}
    >
      {/* Đèn báo Mở Cửa (<|>) */}
      <div
        className={`door-state-indicator ${isDoorOpen ? 'indicator-open-active' : ''}`}
        title={`E${elevatorId} - Floor ${floor}: Đèn báo mở cửa (Chỉ hiển thị)`}
        aria-label={`Door open indicator on elevator ${elevatorId}`}
      >
        <UnfoldHorizontal size={13} />
      </div>

      {/* Đèn báo Đóng Cửa (>|<) */}
      <div
        className={`door-state-indicator ${isDoorClosing ? 'indicator-closing-active' : ''}`}
        title={`E${elevatorId} - Floor ${floor}: Đèn báo đóng cửa (Chỉ hiển thị)`}
        aria-label={`Door closing indicator on elevator ${elevatorId}`}
      >
        <FoldHorizontal size={13} />
      </div>
    </div>
  );
};
