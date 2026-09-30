import React from 'react';
import { Terminal, Clock } from 'lucide-react';
import { useElevator } from '../../hooks/useElevator';
import { formatTimestamp } from '../../../../shared/utils/format-time';

export const EventLog: React.FC = () => {
  const { state } = useElevator();

  return (
    <div className="glass-panel event-log-container">
      <div className="event-log-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
          <Terminal size={18} color="var(--accent-cyan)" />
          <span>Real-time Event Stream</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Clock size={14} />
          <span>{state.logs.length} events</span>
        </div>
      </div>

      <div className="event-log-list">
        {state.logs.map((log) => (
          <div key={log.id} className={`event-log-item ${log.type}`}>
            <span className="event-log-time">[{formatTimestamp(log.timestamp)}]</span>
            <span className="event-log-msg">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
