import React from 'react';
import { Activity, Gauge } from 'lucide-react';
import { useElevator } from '../../hooks/useElevator';
import { selectElevatorList } from '../../model/selectors';
import { DestinationPanel } from '../Elevator/DestinationPanel';

export const ElevatorStatusPanel: React.FC = () => {
  const { state, setSelectedElevatorId } = useElevator();
  const elevatorList = selectElevatorList(state);
  const selectedElevator = state.elevators[state.selectedElevatorId] || elevatorList[0];

  const getStatusBadgeClass = (elvState: string) => {
    if (elvState.startsWith('MOVING')) return 'moving';
    if (elvState.startsWith('DOOR')) return 'door';
    return 'idle';
  };

  const getDirectionSymbol = (direction: string) => {
    if (direction === 'UP') return '↑';
    if (direction === 'DOWN') return '↓';
    return '—';
  };

  const allTargets = selectedElevator
    ? [
        ...selectedElevator.destinationRequests,
        ...selectedElevator.hallRequests.map((h) => `${h.floor} (${h.direction})`),
      ]
    : [];

  return (
    <div className="glass-panel status-panel-container">
      <div className="status-panel-header">
        <div className="status-panel-title">
          <Gauge size={18} color="var(--accent-cyan)" />
          <span>Fleet Diagnostics & Controls</span>
        </div>
        <div className="status-panel-indicator">
          <Activity size={14} />
          <span>Live</span>
        </div>
      </div>

      {/* 3-Tab Elevator Selector */}
      <div className="elevator-tab-selector" role="tablist">
        {elevatorList.map((elv) => {
          const isSelected = elv.id === state.selectedElevatorId;
          const badgeClass = getStatusBadgeClass(elv.state);

          return (
            <button
              key={elv.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`elevator-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedElevatorId(elv.id)}
            >
              <div className="tab-btn-header">
                <span className="tab-elv-name">Elevator {elv.id}</span>
                <span className={`tab-dir ${elv.direction}`}>
                  {getDirectionSymbol(elv.direction)}
                </span>
              </div>
              <div className="tab-btn-meta">
                <span className="tab-floor-tag">{elv.currentFloor}F</span>
                <span className={`status-badge-mini ${badgeClass}`}>{elv.doorState}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Elevator Detailed Card & Keypad */}
      {selectedElevator && (
        <div className="selected-elevator-card">
          <div className="card-top-row">
            <div className="card-elevator-name">
              <span>Elevator {selectedElevator.id} Active Control</span>
            </div>
            <span className={`status-badge ${getStatusBadgeClass(selectedElevator.state)}`}>
              {selectedElevator.state}
            </span>
          </div>

          <div className="card-metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Current Floor</span>
              <span className="metric-value">{selectedElevator.currentFloor}F</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Direction</span>
              <span className="metric-value">{selectedElevator.direction}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Door State</span>
              <span className="metric-value">{selectedElevator.doorState}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Target Queue</span>
              <span
                className="metric-value"
                style={{
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={allTargets.length > 0 ? allTargets.join(', ') : 'None'}
              >
                {allTargets.length > 0 ? allTargets.join(', ') : 'None'}
              </span>
            </div>
          </div>

          {/* Cabin Keypad & Door Controls for Selected Elevator */}
          <DestinationPanel elevatorId={selectedElevator.id} />
        </div>
      )}
    </div>
  );
};
