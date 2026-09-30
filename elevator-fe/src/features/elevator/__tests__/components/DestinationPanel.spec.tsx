import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../../test/test-utils';
import { DestinationPanel } from '../../components/Elevator/DestinationPanel';
import { createDefaultElevatorSnapshot } from '../../model/state';

describe('DestinationPanel & ElevatorControls Components', () => {
  it('Render đủ 10 nút bấm bàn phím từ tầng 1 đến tầng 10', () => {
    renderWithContext(<DestinationPanel elevatorId={1} />);

    for (let floor = 1; floor <= 10; floor++) {
      expect(screen.getByTestId(`btn-floor-1-${floor}`)).toBeInTheDocument();
    }
  });

  it('Click nút tầng N -> Kích hoạt selectDestination(elevatorId, N)', async () => {
    const user = userEvent.setup();
    const selectDestinationMock = vi.fn().mockResolvedValue(undefined);

    renderWithContext(<DestinationPanel elevatorId={2} />, {
      contextOverrides: { selectDestination: selectDestinationMock },
    });

    const floor8Btn = screen.getByTestId('btn-floor-2-8');
    await user.click(floor8Btn);

    expect(selectDestinationMock).toHaveBeenCalledWith(2, 8);
  });

  it('Nút của tầng đích đã được chọn sáng màu vàng (.active-yellow)', () => {
    const elevatorWithDestinations = {
      ...createDefaultElevatorSnapshot(1),
      destinationRequests: [4, 9],
    };

    renderWithContext(<DestinationPanel elevatorId={1} />, {
      initialState: {
        elevators: { 1: elevatorWithDestinations },
      },
    });

    const floor4Btn = screen.getByTestId('btn-floor-1-4');
    const floor9Btn = screen.getByTestId('btn-floor-1-9');
    const floor5Btn = screen.getByTestId('btn-floor-1-5');

    expect(floor4Btn).toHaveClass('active-yellow');
    expect(floor9Btn).toHaveClass('active-yellow');
    expect(floor5Btn).not.toHaveClass('active-yellow');
  });

  it('Nút Mở cửa trong cabin gọi pressOpenDoor(elevatorId)', async () => {
    const user = userEvent.setup();
    const pressOpenDoorMock = vi.fn().mockResolvedValue(undefined);

    renderWithContext(<DestinationPanel elevatorId={1} />, {
      contextOverrides: { pressOpenDoor: pressOpenDoorMock },
    });

    const openDoorBtn = screen.getByRole('button', { name: /Open door/i });
    await user.click(openDoorBtn);

    expect(pressOpenDoorMock).toHaveBeenCalledWith(1);
  });

  it('Nút Đóng cửa trong cabin gọi pressCloseDoor(elevatorId)', async () => {
    const user = userEvent.setup();
    const pressCloseDoorMock = vi.fn().mockResolvedValue(undefined);

    const openElevator = {
      ...createDefaultElevatorSnapshot(1),
      doorState: 'OPEN' as const,
    };

    renderWithContext(<DestinationPanel elevatorId={1} />, {
      initialState: {
        elevators: { 1: openElevator },
      },
      contextOverrides: { pressCloseDoor: pressCloseDoorMock },
    });

    const closeDoorBtn = screen.getByRole('button', { name: /Close door/i });
    await user.click(closeDoorBtn);

    expect(pressCloseDoorMock).toHaveBeenCalledWith(1);
  });
});
