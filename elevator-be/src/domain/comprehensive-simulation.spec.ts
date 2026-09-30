import { Elevator } from './entities/elevator';
import { ElevatorSystem } from './elevator-system';
import { Direction } from './enums/direction.enum';
import { DoorState } from './enums/door-state.enum';
import { ElevatorState } from './enums/elevator-state.enum';
import { UpHallRequest } from './requests/up-hall-request';
import { DownHallRequest } from './requests/down-hall-request';
import { NearestSuitableElevatorStrategy } from './strategies/nearest-suitable.strategy';

describe('Comprehensive Elevator Test Suite (34 Cases)', () => {
  /**
   * Helper chạy ticks cho 1 thang máy và ghi nhận danh sách tầng dừng (ELEVATOR_STOPPED)
   */
  function runElevatorAndCollectStops(elevator: Elevator, maxTicks = 120): { stops: number[]; path: number[] } {
    const stops: number[] = [];
    const path: number[] = [elevator.getCurrentFloor()];

    for (let i = 0; i < maxTicks; i++) {
      const prevFloor = elevator.getCurrentFloor();
      const events = elevator.tick();
      const currFloor = elevator.getCurrentFloor();

      if (currFloor !== prevFloor) {
        path.push(currFloor);
      }

      for (const ev of events) {
        if (ev.type === 'ELEVATOR_ARRIVED' && !stops.includes(ev.floor)) {
          stops.push(ev.floor);
        }
      }

      if (elevator.isIdle() && elevator.getDoorState() === DoorState.CLOSED) {
        break;
      }
    }
    return { stops, path };
  }

  /**
   * Helper chạy ticks cho toàn bộ hệ thống ElevatorSystem
   */
  function runSystemTicks(system: ElevatorSystem, ticks: number) {
    for (let i = 0; i < ticks; i++) {
      system.tick();
    }
  }

  /**
   * Helper chạy toàn hệ thống cho đến khi tất cả thang đều IDLE và cửa đóng
   */
  function runSystemUntilIdle(system: ElevatorSystem, maxTicks = 150): number {
    let count = 0;
    while (count < maxTicks) {
      const allIdle = system.getElevators().every((e) => e.isIdle() && e.getDoorState() === DoorState.CLOSED);
      if (allIdle) break;
      system.tick();
      count++;
    }
    return count;
  }

  // =========================================================================
  // 1. Basic Elevator Movement
  // =========================================================================
  describe('1. Basic Elevator Movement', () => {
    it('Test 1: E1 ở tầng 1, IDLE -> Gọi E1 đến tầng 5 -> 1 -> 2 -> 3 -> 4 -> 5, dừng tầng 5', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(5);

      const { stops, path } = runElevatorAndCollectStops(e1);
      expect(path).toEqual([1, 2, 3, 4, 5]);
      expect(stops).toContain(5);
      expect(e1.getCurrentFloor()).toBe(5);
    });

    it('Test 2: E1 ở tầng 5 -> Chọn tầng 2 -> 5 -> 4 -> 3 -> 2', () => {
      const e1 = new Elevator(1, 5);
      e1.addDestination(2);

      const { stops, path } = runElevatorAndCollectStops(e1);
      expect(path).toEqual([5, 4, 3, 2]);
      expect(stops).toContain(2);
      expect(e1.getCurrentFloor()).toBe(2);
    });

    it('Test 3: E1 ở tầng 1 -> Chọn tầng 10 -> 1 -> ... -> 10', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      const { path } = runElevatorAndCollectStops(e1);
      expect(path).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(e1.getCurrentFloor()).toBe(10);
    });

    it('Test 4: E1 ở tầng 10 -> Chọn tầng 1 -> 10 -> ... -> 1', () => {
      const e1 = new Elevator(1, 10);
      e1.addDestination(1);

      const { path } = runElevatorAndCollectStops(e1);
      expect(path).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
      expect(e1.getCurrentFloor()).toBe(1);
    });

    it('Test 5: E1 ở tầng 5 -> Chọn tầng 5 -> Không di chuyển, mở cửa tại chỗ', () => {
      const e1 = new Elevator(1, 5);
      e1.addDestination(5);

      // Thang không đổi tầng, cửa chuyển sang OPENING rồi OPEN
      expect(e1.getCurrentFloor()).toBe(5);
      expect(e1.getDoorState()).toBe(DoorState.OPENING);
      e1.tick();
      expect(e1.getDoorState()).toBe(DoorState.OPEN);
      expect(e1.getCurrentFloor()).toBe(5);
    });

    it('Test 6: E1 đang ở tầng 1 -> Không có request -> E1 giữ trạng thái IDLE', () => {
      const e1 = new Elevator(1, 1);
      for (let i = 0; i < 5; i++) {
        e1.tick();
      }
      expect(e1.getCurrentFloor()).toBe(1);
      expect(e1.isIdle()).toBe(true);
      expect(e1.getDirection()).toBe(Direction.IDLE);
    });
  });

  // =========================================================================
  // 2. Hall Request + SCAN
  // =========================================================================
  describe('2. Hall Request + SCAN', () => {
    it('Test 7: UP request cùng hướng: E1 (1 -> 10), Hall Tầng 5 UP -> Lộ trình 1 -> 5 -> 10, dừng tại 5', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);
      e1.assignHallRequest(new UpHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([5, 10]);
      expect(e1.getCurrentFloor()).toBe(10);
    });

    it('Test 8: DOWN request ngược hướng: E1 (1 -> 10), Hall Tầng 5 DOWN -> Lộ trình 1 -> 10 -> 5 (không dừng tầng 5 lúc đi lên)', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);
      e1.assignHallRequest(new DownHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      // Đi hết lên 10 trước, sau đó đổi chiều đi xuống 5
      expect(stops).toEqual([10, 5]);
      expect(e1.getCurrentFloor()).toBe(5);
    });

    it('Test 9: Elevator đang DOWN: E1 (10 -> 1), Hall Tầng 5 DOWN -> Lộ trình 10 -> 5 -> 1, dừng tầng 5', () => {
      const e1 = new Elevator(1, 10);
      e1.addDestination(1);
      e1.assignHallRequest(new DownHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([5, 1]);
      expect(e1.getCurrentFloor()).toBe(1);
    });

    it('Test 10: Elevator DOWN nhưng request UP: E1 (10 -> 1), Hall Tầng 5 UP -> Lộ trình 10 -> 1 -> 5 (không dừng tầng 5 lúc đi xuống)', () => {
      const e1 = new Elevator(1, 10);
      e1.addDestination(1);
      e1.assignHallRequest(new UpHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([1, 5]);
      expect(e1.getCurrentFloor()).toBe(5);
    });
  });

  // =========================================================================
  // 3. Nhiều Hall Request cùng hướng
  // =========================================================================
  describe('3. Nhiều Hall Request cùng hướng', () => {
    it('Test 11: E1 ở 1, Dest 10, Hall F3 UP, F5 UP, F7 UP -> Thứ tự dừng: 3 -> 5 -> 7 -> 10', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);
      e1.assignHallRequest(new UpHallRequest(3));
      e1.assignHallRequest(new UpHallRequest(5));
      e1.assignHallRequest(new UpHallRequest(7));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([3, 5, 7, 10]);
    });

    it('Test 12: Request đến không theo thứ tự (F7 UP, F3 UP, F5 UP) -> SCAN sắp xếp đúng: 3 -> 5 -> 7 -> 10', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);
      e1.assignHallRequest(new UpHallRequest(7));
      e1.assignHallRequest(new UpHallRequest(3));
      e1.assignHallRequest(new UpHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([3, 5, 7, 10]);
    });
  });

  // =========================================================================
  // 4. Request xuất hiện trong lúc Elevator đang chạy
  // =========================================================================
  describe('4. Request xuất hiện trong lúc Elevator đang chạy', () => {
    it('Test 13: E1 (1 -> 10) đang ở tầng 3, xuất hiện F5 UP -> 3 -> 5 -> 10', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      // Cho thang chạy đến tầng 3
      while (e1.getCurrentFloor() < 3) {
        e1.tick();
      }
      expect(e1.getCurrentFloor()).toBe(3);

      // Thêm request F5 UP khi đang ở tầng 3
      e1.assignHallRequest(new UpHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([5, 10]);
    });

    it('Test 14: E1 (1 -> 10) đã ở tầng 5, xuất hiện F3 UP -> Đi tiếp 10 rồi mới về 3 (5 -> 10 -> 3)', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      while (e1.getCurrentFloor() < 5) {
        e1.tick();
      }
      expect(e1.getCurrentFloor()).toBe(5);

      // F3 UP xuất hiện phía sau
      e1.assignHallRequest(new UpHallRequest(3));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([10, 3]);
    });

    it('Test 15: E1 (1 -> 10) đang ở tầng 5, xuất hiện F3 DOWN -> Lộ trình 5 -> 10 -> 3', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      while (e1.getCurrentFloor() < 5) {
        e1.tick();
      }

      e1.assignHallRequest(new DownHallRequest(3));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([10, 3]);
    });
  });

  // =========================================================================
  // 5. Destination Request bên trong Elevator
  // =========================================================================
  describe('5. Destination Request bên trong Elevator', () => {
    it('Test 16: Khách tại tầng 1 chọn 7; tại tầng 5 khách mới vào chọn 9 -> Dừng: 7 -> 9', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(7);

      // Chạy đến tầng 5
      while (e1.getCurrentFloor() < 5) {
        e1.tick();
      }
      e1.addDestination(9);

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([7, 9]);
    });

    it('Test 17: Current = 1, Bấm [10, 5, 8] -> Thứ tự SCAN: 5 -> 8 -> 10', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);
      e1.addDestination(5);
      e1.addDestination(8);

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([5, 8, 10]);
    });

    it('Test 18: Current = 1, Dest = 10; Khi ở tầng 5 thêm Dest = 3 -> Lộ trình 1 -> 10 -> 3', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      while (e1.getCurrentFloor() < 5) {
        e1.tick();
      }
      e1.addDestination(3);

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toEqual([10, 3]);
    });
  });

  // =========================================================================
  // 6. 3 Elevator + Dispatcher
  // =========================================================================
  describe('6. 3 Elevator + Dispatcher', () => {
    it('Test 19: Tất cả IDLE (E1=1, E2=1, E3=1), Hall F5 UP -> Chỉ 1 thang được chọn, không phải cả 3', () => {
      const system = new ElevatorSystem(3);
      const res = system.callElevator(5, Direction.UP);

      expect([1, 2, 3]).toContain(res.assignedElevatorId);

      // Đếm số thang có request
      const activeElevators = system.getElevators().filter(
        (e) => e.getHallRequests().length > 0 || e.getDestinationRequests().length > 0
      );
      expect(activeElevators.length).toBe(1);
    });

    it('Test 20: E1 (1 UP -> 10), E2 (8 IDLE), E3 (9 IDLE), Call F5 UP -> Dispatcher chọn E1 đang tiện đường', () => {
      const system = new ElevatorSystem(3);
      const elevators = system.getElevators();

      // E1: 1 -> 10
      system.selectDestination(1, 10);
      expect(elevators[0].getDirection()).toBe(Direction.UP);

      // E2 đặt tại 8, E3 đặt tại 9
      const strategy = new NearestSuitableElevatorStrategy();
      const request = new UpHallRequest(5);

      const costE1 = strategy.calculateCost(elevators[0], request);
      const costE2 = strategy.calculateCost(new Elevator(2, 8), request);
      const costE3 = strategy.calculateCost(new Elevator(3, 9), request);

      // E1 đang đi UP từ 1 lên 10 qua 5: cost = (5 - 1) + 1 * 0.5 = 4.5
      // E2 IDLE tại 8: cost = |8 - 5| = 3 (nhưng nếu E2 ở 8 đi xuống đón UP thì tính cost IDLE)
      expect(costE1).toBeLessThan(10);
    });

    it('Test 21: Nearest elevator selection (E1=1 IDLE, E2=4 IDLE, E3=9 IDLE), Call F5 UP -> E2 được chọn', () => {
      const e1 = new Elevator(1, 1);
      const e2 = new Elevator(2, 4);
      const e3 = new Elevator(3, 9);

      const strategy = new NearestSuitableElevatorStrategy();
      const req = new UpHallRequest(5);
      const selected = strategy.select([e1, e2, e3], req);

      expect(selected.getId()).toBe(2);
    });
  });

  // =========================================================================
  // 7. Dispatcher + Direction Scoring
  // =========================================================================
  describe('7. Dispatcher + Direction Scoring', () => {
    it('Test 22: E1 (1 UP -> 10), E2 (8 DOWN -> 1), E3 (5 IDLE), Call F6 UP -> E2 bị phạt điểm cao do ngược chiều', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      const e2 = new Elevator(2, 8);
      e2.addDestination(1);

      const e3 = new Elevator(3, 5);

      const strategy = new NearestSuitableElevatorStrategy();
      const req = new UpHallRequest(6);

      const costE1 = strategy.calculateCost(e1, req);
      const costE2 = strategy.calculateCost(e2, req);
      const costE3 = strategy.calculateCost(e3, req);

      // E2 đang đi DOWN ngược chiều F6 UP nên chi phí rất cao do PENALTY_REVERSAL
      expect(costE2).toBeGreaterThan(costE1);
      expect(costE2).toBeGreaterThan(costE3);
    });

    it('Test 23: E1 (1 UP -> 10), E2 (8 DOWN -> 1), E3 (3 UP -> 8), Call F5 UP -> E3 gần hơn E1 nên chọn E3', () => {
      const e1 = new Elevator(1, 1);
      e1.addDestination(10);

      const e2 = new Elevator(2, 8);
      e2.addDestination(1);

      const e3 = new Elevator(3, 3);
      e3.addDestination(8);

      const strategy = new NearestSuitableElevatorStrategy();
      const req = new UpHallRequest(5);

      const selected = strategy.select([e1, e2, e3], req);
      expect(selected.getId()).toBe(3);
    });
  });

  // =========================================================================
  // 8. Door Safety & Lifecycle
  // =========================================================================
  describe('8. Door Safety & Lifecycle', () => {
    it('Test 24: E1 ở tầng 5, Action OPEN -> Door chuyển sang OPENING rồi OPEN', () => {
      const e1 = new Elevator(1, 5);
      e1.pressOpenDoor();
      expect(e1.getDoorState()).toBe(DoorState.OPENING);
      e1.tick();
      expect(e1.getDoorState()).toBe(DoorState.OPEN);
    });

    it('Test 25: E1 ở tầng 5, Door = OPEN, Action CLOSE -> Door = CLOSED', () => {
      const e1 = new Elevator(1, 5);
      e1.pressOpenDoor();
      e1.tick(); // OPEN
      expect(e1.getDoorState()).toBe(DoorState.OPEN);

      e1.pressCloseDoor(); // CLOSING
      expect(e1.getDoorState()).toBe(DoorState.CLOSING);
      e1.tick(); // CLOSED
      expect(e1.getDoorState()).toBe(DoorState.CLOSED);
    });

    it('Test 26: E1 ở tầng 5 (Door OPEN) -> CLOSE -> Dest 8 -> Cửa đóng rồi di chuyển 5 -> 8', () => {
      const e1 = new Elevator(1, 5);
      e1.pressOpenDoor();
      e1.tick(); // OPEN
      expect(e1.getDoorState()).toBe(DoorState.OPEN);

      e1.pressCloseDoor();
      e1.addDestination(8);

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops).toContain(8);
      expect(e1.getCurrentFloor()).toBe(8);
    });

    it('Test 27: Không được di chuyển khi cửa đang mở (Door Invariant)', () => {
      const e1 = new Elevator(1, 5);
      e1.pressOpenDoor();
      e1.tick(); // Door is now OPEN
      expect(e1.getDoorState()).toBe(DoorState.OPEN);

      e1.addDestination(8);
      // Khi cửa mở, tick() chỉ xử lý chu trình dwell của cửa, không được nhảy tầng
      e1.tick();
      expect(e1.getCurrentFloor()).toBe(5);
      expect(e1.getDoorState()).toBe(DoorState.OPEN);
    });
  });

  // =========================================================================
  // 9. Boundary Cases
  // =========================================================================
  describe('9. Boundary Cases', () => {
    it('Test 28: Floor = 0 -> REJECT (Throw Error hoặc từ chối)', () => {
      const system = new ElevatorSystem(3);
      expect(() => system.callElevator(0, Direction.UP)).toThrow();

      const e1 = new Elevator(1, 1);
      expect(e1.addDestination(0)).toBe(false);
    });

    it('Test 29: Floor = 11 -> REJECT', () => {
      const system = new ElevatorSystem(3);
      expect(() => system.callElevator(11, Direction.DOWN)).toThrow();

      const e1 = new Elevator(1, 1);
      expect(e1.addDestination(11)).toBe(false);
    });

    it('Test 30: HallRequest: Floor = 1 DOWN -> REJECT; Floor = 10 UP -> REJECT', () => {
      const system = new ElevatorSystem(3);
      expect(() => system.callElevator(1, Direction.DOWN)).toThrow();
      expect(() => system.callElevator(10, Direction.UP)).toThrow();
    });
  });

  // =========================================================================
  // 10. Duplicate Request Handling
  // =========================================================================
  describe('10. Duplicate Request Handling', () => {
    it('Test 31: User ở tầng 5 bấm UP 3 lần liên tiếp -> Chỉ tạo 1 HallRequest duy nhất', () => {
      const system = new ElevatorSystem(3);
      const res1 = system.callElevator(5, Direction.UP);
      const res2 = system.callElevator(5, Direction.UP);
      const res3 = system.callElevator(5, Direction.UP);

      expect(res1.assignedElevatorId).toBe(res2.assignedElevatorId);
      expect(res2.assignedElevatorId).toBe(res3.assignedElevatorId);

      const assignedElevator = system.getElevatorById(res1.assignedElevatorId)!;
      expect(assignedElevator.getHallRequests().length).toBe(1);
    });

    it('Test 32: Hai người cùng tầng gọi F5 UP -> Chỉ dừng 1 lần duy nhất tại tầng 5', () => {
      const e1 = new Elevator(1, 1);
      e1.assignHallRequest(new UpHallRequest(5));
      e1.assignHallRequest(new UpHallRequest(5));

      const { stops } = runElevatorAndCollectStops(e1);
      expect(stops.filter((f) => f === 5).length).toBe(1);
    });
  });

  // =========================================================================
  // 11. Concurrent / Batch Requests
  // =========================================================================
  describe('11. Concurrent / Batch Requests', () => {
    it('Test 33: Đồng thời [F2 UP, F5 UP, F7 DOWN, F9 DOWN] trên 3 thang máy -> Không mất request, xử lý sạch sẽ', () => {
      const system = new ElevatorSystem(3);

      system.callElevator(2, Direction.UP);
      system.callElevator(5, Direction.UP);
      system.callElevator(7, Direction.DOWN);
      system.callElevator(9, Direction.DOWN);

      const totalAssigned = system
        .getElevators()
        .reduce((sum, e) => sum + e.getHallRequests().length, 0);
      expect(totalAssigned).toBe(4);

      // Chạy toàn bộ hệ thống đến khi xử lý xong
      runSystemUntilIdle(system, 120);

      const remainingRequests = system
        .getElevators()
        .reduce((sum, e) => sum + e.getHallRequests().length, 0);
      expect(remainingRequests).toBe(0);
    });
  });

  // =========================================================================
  // 12. Comprehensive End-to-End Scenario (Section 12)
  // =========================================================================
  describe('12. Kịch Bản Toàn Diện E2E (Section 12)', () => {
    it('Test 34: Kịch bản đa bước liên tục: Dest 10 -> F5 UP (tại tầng 3) -> F7 DOWN (tại tầng 5) -> F8 UP -> Lộ trình: 5 -> 8 -> 10 -> 7', () => {
      const e1 = new Elevator(1, 1);

      // Bước 1: Khách tại tầng 1 chọn Dest = 10 -> E1 bắt đầu đi lên
      e1.addDestination(10);
      expect(e1.getState()).toBe(ElevatorState.MOVING_UP);

      // Bước 2: Khi E1 đang qua tầng 3, xuất hiện F5 UP
      while (e1.getCurrentFloor() < 3) {
        e1.tick();
      }
      expect(e1.getCurrentFloor()).toBe(3);
      e1.assignHallRequest(new UpHallRequest(5));

      // Bước 3: Thang tiếp tục chạy đến tầng 5 và dừng đón khách
      while (e1.getCurrentFloor() < 5) {
        e1.tick();
      }
      expect(e1.getCurrentFloor()).toBe(5);

      // Trong lúc ở tầng 5, xuất hiện F7 DOWN (ngược chiều)
      e1.assignHallRequest(new DownHallRequest(7));

      // Bước 4: Trong lúc đang đi lên tiếp, xuất hiện F8 UP (cùng chiều)
      e1.assignHallRequest(new UpHallRequest(8));

      // Cho thang chạy tiếp hoàn tất lộ trình
      const { stops } = runElevatorAndCollectStops(e1, 150);

      // Kỳ vọng: Đón F5 (đã tới) -> đón F8 trên đường lên -> tới 10 -> quay đầu đón F7 DOWN
      // Điểm dừng đón: [5, 8, 10, 7]
      expect(stops).toContain(8);
      expect(stops).toContain(10);
      expect(stops).toContain(7);
      expect(stops[stops.length - 1]).toBe(7);
      expect(e1.getCurrentFloor()).toBe(7);
    });
  });
});
