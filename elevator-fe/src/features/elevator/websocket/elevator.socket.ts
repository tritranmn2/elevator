import { io, type Socket } from 'socket.io-client';
import { APP_CONFIG } from '../../../app/config';
import { ELEVATOR_CONSTANTS } from '../constants';
import type {
  DoorStateChangedEvent,
  ElevatorArrivedEvent,
  SimulationTickPayload,
  SystemSnapshot,
} from '../model/types';

export class ElevatorSocketClient {
  private socket: Socket | null = null;

  public connect(handlers: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSnapshot?: (snapshot: SystemSnapshot) => void;
    onTick?: (payload: SimulationTickPayload) => void;
    onElevatorArrived?: (event: ElevatorArrivedEvent) => void;
    onDoorStateChanged?: (event: DoorStateChangedEvent) => void;
  }): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(APP_CONFIG.WS_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      handlers.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      handlers.onDisconnect?.();
    });

    this.socket.on(ELEVATOR_CONSTANTS.WS_EVENTS.SIMULATION_SNAPSHOT, (snapshot: SystemSnapshot) => {
      handlers.onSnapshot?.(snapshot);
    });

    this.socket.on(ELEVATOR_CONSTANTS.WS_EVENTS.SIMULATION_TICK, (payload: SimulationTickPayload) => {
      handlers.onTick?.(payload);
    });

    this.socket.on(ELEVATOR_CONSTANTS.WS_EVENTS.ELEVATOR_ARRIVED, (event: ElevatorArrivedEvent) => {
      handlers.onElevatorArrived?.(event);
    });

    this.socket.on(
      ELEVATOR_CONSTANTS.WS_EVENTS.DOOR_STATE_CHANGED,
      (event: DoorStateChangedEvent) => {
        handlers.onDoorStateChanged?.(event);
      },
    );

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const elevatorSocketClient = new ElevatorSocketClient();
