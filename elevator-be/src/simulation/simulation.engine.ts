import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ElevatorSystem } from '../domain/elevator-system';
import { ElevatorEvent } from '../domain/events/elevator-event';
import { SystemSnapshot } from '../domain/snapshots/elevator-snapshot';
import { ELEVATOR_CONSTANTS } from '../domain/constants/elevator.constants';
import { SYSTEM_MESSAGES } from '../domain/constants/messages.constants';

export type SimulationTickListener = (snapshot: SystemSnapshot, events: ElevatorEvent[]) => void;

@Injectable()
export class SimulationEngine implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulationEngine.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private tickIntervalMs: number = ELEVATOR_CONSTANTS.SIMULATION_TICK_MS;
  private readonly listeners: Set<SimulationTickListener> = new Set();

  constructor(private readonly elevatorSystem: ElevatorSystem) {}

  onModuleInit() {
    this.start();
  }

  onModuleDestroy() {
    this.stop();
  }

  public subscribe(listener: SimulationTickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.log(SYSTEM_MESSAGES.LOG.SIMULATION_START(this.tickIntervalMs));

    this.timer = setInterval(() => {
      this.step();
    }, this.tickIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.logger.log(SYSTEM_MESSAGES.LOG.SIMULATION_STOP);
  }

  /**
   * Thực hiện 1 bước nhảy simulation (1 tick)
   */
  public step(): { snapshot: SystemSnapshot; events: ElevatorEvent[] } {
    const events = this.elevatorSystem.tick();
    const snapshot = this.elevatorSystem.getSnapshot();

    // Thông báo cho tất cả listeners (WebSocket gateway, logger)
    for (const listener of this.listeners) {
      try {
        listener(snapshot, events);
      } catch (err) {
        this.logger.error(SYSTEM_MESSAGES.LOG.SIMULATION_LISTENER_ERROR, err);
      }
    }

    return { snapshot, events };
  }

  public getElevatorSystem(): ElevatorSystem {
    return this.elevatorSystem;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}
