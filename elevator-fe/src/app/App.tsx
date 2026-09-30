import React from 'react';
import { Layers, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { ElevatorProvider } from '../features/elevator/context/ElevatorContext';
import { useElevator } from '../features/elevator/hooks/useElevator';
import { Building } from '../features/elevator/components/Building/Building';
import { ElevatorStatusPanel } from '../features/elevator/components/StatusPanel/ElevatorStatusPanel';
import { EventLog } from '../features/elevator/components/EventLog/EventLog';
import '../styles/globals.css';
import '../styles/elevator.css';

const ElevatorAppContent: React.FC = () => {
  const { state, dispatch } = useElevator();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-panel app-header">
        <div className="header-brand">
          <div className="header-icon">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="header-title">ELEVATOR SIMULATION SYSTEM</h1>
            <p className="header-subtitle">
              3 Parallel Elevators • 10 Floors • Real-time SCAN Algorithm
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`header-status-badge ${!state.connected ? 'disconnected' : ''}`}>
            {state.connected ? (
              <>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--status-up)',
                  }}
                  className="animate-pulse-dot"
                />
                <Wifi size={14} />
                <span>REALTIME CONNECTED</span>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--status-error)',
                  }}
                />
                <WifiOff size={14} />
                <span>DISCONNECTED</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Error alert if any */}
      {state.error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{state.error}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <main className="dashboard-grid">
        {/* Left: Building Visualization */}
        <section>
          <Building />
        </section>

        {/* Right: Status Diagnostics, Destination Keypads & Event Log */}
        <section className="sidebar-section">
          <ElevatorStatusPanel />
          <EventLog />
        </section>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ElevatorProvider>
      <ElevatorAppContent />
    </ElevatorProvider>
  );
};

export default App;
