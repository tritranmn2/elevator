import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../../test/test-utils';
import { FloorCallButtons, FloorDoorIndicators } from '../../components/Building/FloorElevatorControls';
import { createDefaultElevatorSnapshot } from '../../model/state';

describe('FloorElevatorControls Component Rules', () => {
  describe('FloorCallButtons (Nút bấm gọi thang Lên / Xuống)', () => {
    it('Tầng 10: Chỉ có nút DOWN, KHÔNG có nút UP, có placeholder giữ thẳng cột', () => {
      renderWithContext(<FloorCallButtons floor={10} elevatorId={1} />);

      // Không có nút UP
      expect(screen.queryByRole('button', { name: /Call UP/i })).not.toBeInTheDocument();

      // Có nút DOWN
      const downBtn = screen.getByRole('button', { name: /Call DOWN at floor 10/i });
      expect(downBtn).toBeInTheDocument();
    });

    it('Tầng 1: Chỉ có nút UP, KHÔNG có nút DOWN, có placeholder giữ thẳng cột', () => {
      renderWithContext(<FloorCallButtons floor={1} elevatorId={1} />);

      // Có nút UP
      const upBtn = screen.getByRole('button', { name: /Call UP at floor 1/i });
      expect(upBtn).toBeInTheDocument();

      // Không có nút DOWN
      expect(screen.queryByRole('button', { name: /Call DOWN/i })).not.toBeInTheDocument();
    });

    it('Tầng 2 đến 9: Render đầy đủ cả nút UP và DOWN', () => {
      renderWithContext(<FloorCallButtons floor={5} elevatorId={1} />);

      expect(screen.getByRole('button', { name: /Call UP at floor 5/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Call DOWN at floor 5/i })).toBeInTheDocument();
    });

    it('Click nút UP gọi hàm callElevator(floor, "UP")', async () => {
      const user = userEvent.setup();
      const callElevatorMock = vi.fn().mockResolvedValue(undefined);

      renderWithContext(<FloorCallButtons floor={4} elevatorId={2} />, {
        contextOverrides: { callElevator: callElevatorMock },
      });

      const upBtn = screen.getByRole('button', { name: /Call UP at floor 4/i });
      await user.click(upBtn);

      expect(callElevatorMock).toHaveBeenCalledWith(4, 'UP');
    });

    it('Click nút DOWN gọi hàm callElevator(floor, "DOWN")', async () => {
      const user = userEvent.setup();
      const callElevatorMock = vi.fn().mockResolvedValue(undefined);

      renderWithContext(<FloorCallButtons floor={6} elevatorId={3} />, {
        contextOverrides: { callElevator: callElevatorMock },
      });

      const downBtn = screen.getByRole('button', { name: /Call DOWN at floor 6/i });
      await user.click(downBtn);

      expect(callElevatorMock).toHaveBeenCalledWith(6, 'DOWN');
    });

    it('Khi có Hall Call đang pending, nút được highlight màu vàng (.active-yellow)', () => {
      renderWithContext(<FloorCallButtons floor={7} elevatorId={1} />, {
        initialState: {
          activeHallCalls: {
            '7_UP': true,
          },
        },
      });

      const upBtn = screen.getByRole('button', { name: /Call UP at floor 7/i });
      expect(upBtn).toHaveClass('active-yellow');
    });
  });

  describe('FloorDoorIndicators (Đèn báo trạng thái Mở / Đóng)', () => {
    it('Đèn báo mở/đóng là thẻ div chỉ báo, không phải nút bấm có thể click', () => {
      renderWithContext(<FloorDoorIndicators floor={5} elevatorId={1} />);

      // Các chỉ báo không có role='button'
      expect(screen.queryByRole('button', { name: /Door open indicator/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Door closing indicator/i })).not.toBeInTheDocument();
    });

    it('Khi thang máy dừng tại tầng và mở cửa -> Đèn mở sáng xanh lá (.indicator-open-active)', () => {
      const e1 = {
        ...createDefaultElevatorSnapshot(1),
        currentFloor: 5,
        doorState: 'OPEN' as const,
      };

      const { container } = renderWithContext(<FloorDoorIndicators floor={5} elevatorId={1} />, {
        initialState: {
          elevators: { 1: e1 },
        },
      });

      const openIndicator = container.querySelector('.door-state-indicator.indicator-open-active');
      expect(openIndicator).toBeInTheDocument();
    });

    it('Khi thang máy dừng tại tầng và đang đóng cửa -> Đèn đóng sáng xanh cyan (.indicator-closing-active)', () => {
      const e1 = {
        ...createDefaultElevatorSnapshot(1),
        currentFloor: 3,
        doorState: 'CLOSING' as const,
      };

      const { container } = renderWithContext(<FloorDoorIndicators floor={3} elevatorId={1} />, {
        initialState: {
          elevators: { 1: e1 },
        },
      });

      const closingIndicator = container.querySelector('.door-state-indicator.indicator-closing-active');
      expect(closingIndicator).toBeInTheDocument();
    });
  });
});
