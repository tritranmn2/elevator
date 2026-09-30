import { DoorState } from '../enums/door-state.enum';
import { ELEVATOR_CONSTANTS } from '../constants/elevator.constants';

export class Door {
  private state: DoorState = DoorState.CLOSED;
  private dwellTicksRemaining: number = 0;
  private readonly defaultDwellTicks: number;

  constructor(defaultDwellTicks: number = ELEVATOR_CONSTANTS.DEFAULT_DOOR_DWELL_TICKS) {
    this.defaultDwellTicks = defaultDwellTicks;
  }

  public getState(): DoorState {
    return this.state;
  }

  public getDwellTicksRemaining(): number {
    return this.dwellTicksRemaining;
  }

  public isClosed(): boolean {
    return this.state === DoorState.CLOSED;
  }

  public isOpen(): boolean {
    return this.state === DoorState.OPEN;
  }

  public isOpening(): boolean {
    return this.state === DoorState.OPENING;
  }

  public isClosing(): boolean {
    return this.state === DoorState.CLOSING;
  }

  /**
   * Bắt đầu mở cửa (chuyển sang OPENING)
   */
  public triggerOpen(): void {
    if (this.state === DoorState.CLOSED || this.state === DoorState.CLOSING) {
      this.state = DoorState.OPENING;
    }
  }

  /**
   * Xử lý khi người dùng nhấn nút OPEN trên bảng điều khiển:
   * - Nếu cửa đang mở: reset bộ đếm thời gian giữ cửa về giá trị tối đa.
   * - Nếu cửa đang đóng (CLOSING): đảo chiều lập tức sang OPENING.
   * - Nếu cửa đang đóng hoàn toàn: kích hoạt OPENING.
   */
  public pressOpen(): boolean {
    if (this.state === DoorState.OPEN) {
      this.dwellTicksRemaining = this.defaultDwellTicks;
      return true;
    }
    if (this.state === DoorState.CLOSING) {
      this.state = DoorState.OPENING;
      return true;
    }
    if (this.state === DoorState.CLOSED) {
      this.state = DoorState.OPENING;
      return true;
    }
    return false;
  }

  /**
   * Xử lý khi người dùng nhấn nút CLOSE trên bảng điều khiển:
   * - Nếu cửa đang mở: đặt thời gian giữ cửa về 0 để chuyển sang CLOSING ngay lập tức.
   */
  public pressClose(): boolean {
    if (this.state === DoorState.OPEN) {
      this.dwellTicksRemaining = 0;
      this.state = DoorState.CLOSING;
      return true;
    }
    return false;
  }

  /**
   * Xử lý nhịp thời gian (Tick):
   * Quản lý chuyển trạng thái OPENING -> OPEN -> CLOSING -> CLOSED
   */
  public tick(): { stateChanged: boolean; oldState: DoorState; newState: DoorState } {
    const oldState = this.state;

    switch (this.state) {
      case DoorState.OPENING:
        // Sau 1 tick mở, cửa mở hoàn toàn
        this.state = DoorState.OPEN;
        this.dwellTicksRemaining = this.defaultDwellTicks;
        break;

      case DoorState.OPEN:
        if (this.dwellTicksRemaining > 1) {
          this.dwellTicksRemaining--;
        } else {
          // Hết thời gian giữ cửa -> bắt đầu đóng
          this.dwellTicksRemaining = 0;
          this.state = DoorState.CLOSING;
        }
        break;

      case DoorState.CLOSING:
        // Sau 1 tick đóng, cửa đóng hoàn toàn
        this.state = DoorState.CLOSED;
        break;

      case DoorState.CLOSED:
        // Không thay đổi
        break;
    }

    return {
      stateChanged: oldState !== this.state,
      oldState,
      newState: this.state,
    };
  }
}
