import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ElevatorSystem } from '../../domain/elevator-system';
import { SystemSnapshot } from '../../domain/snapshots/elevator-snapshot';
import { ElevatorEvent } from '../../domain/events/elevator-event';
import { WS_EVENTS } from '../../domain/constants/ws-events.constants';
import { SYSTEM_MESSAGES } from '../../domain/constants/messages.constants';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ElevatorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(ElevatorGateway.name);

  constructor(private readonly elevatorSystem: ElevatorSystem) {}

  afterInit(server: Server) {
    this.logger.log(SYSTEM_MESSAGES.LOG.WS_INITIALIZED);
  }

  handleConnection(client: Socket) {
    this.logger.log(SYSTEM_MESSAGES.LOG.WS_CONNECTED(client.id));
    // Gửi ngay snapshot hiện tại cho client mới kết nối
    const snapshot = this.elevatorSystem.getSnapshot();
    client.emit(WS_EVENTS.SIMULATION_SNAPSHOT, snapshot);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(SYSTEM_MESSAGES.LOG.WS_DISCONNECTED(client.id));
  }

  /**
   * Broadcast snapshot định kỳ mỗi tick (Snapshot Stream)
   */
  public broadcastSystemTick(snapshot: SystemSnapshot, events: ElevatorEvent[]) {
    if (this.server) {
      this.server.emit(WS_EVENTS.SIMULATION_TICK, {
        snapshot,
        events,
      });

      // Emit delta events riêng biệt nếu có sự kiện tức thì
      for (const event of events) {
        if (event.type === 'ELEVATOR_ARRIVED') {
          this.server.emit(WS_EVENTS.ELEVATOR_ARRIVED, event);
        } else if (event.type === 'DOOR_STATE_CHANGED') {
          this.server.emit(WS_EVENTS.DOOR_STATE_CHANGED, event);
        }
      }
    }
  }
}
