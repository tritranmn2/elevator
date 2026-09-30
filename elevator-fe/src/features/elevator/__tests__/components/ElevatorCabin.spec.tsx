import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../../test/test-utils';
import { ElevatorCabin } from '../../components/Elevator/ElevatorCabin';
import { createDefaultElevatorSnapshot } from '../../model/state';

describe('ElevatorCabin & ElevatorDoor Components', () => {
  it('Khi cửa mở (OPEN hoặc OPENING) -> Cabin có viền xanh lá (.door-open-green)', () => {
    const openElevator = {
      ...createDefaultElevatorSnapshot(1),
      currentFloor: 4,
      doorState: 'OPEN' as const,
    };

    renderWithContext(<ElevatorCabin elevator={openElevator} />);

    const cabin = screen.getByTestId('elevator-cabin-1');
    expect(cabin).toHaveClass('door-open-green');
  });

  it('Khi cửa đóng (CLOSED) -> Cabin KHÔNG có class .door-open-green', () => {
    const closedElevator = {
      ...createDefaultElevatorSnapshot(2),
      currentFloor: 7,
      doorState: 'CLOSED' as const,
    };

    renderWithContext(<ElevatorCabin elevator={closedElevator} />);

    const cabin = screen.getByTestId('elevator-cabin-2');
    expect(cabin).not.toHaveClass('door-open-green');
  });

  it('Click vào cabin -> Kích hoạt setSelectedElevatorId với ID tương ứng', async () => {
    const user = userEvent.setup();
    const setSelectedElevatorIdMock = vi.fn();
    const elevator = createDefaultElevatorSnapshot(3);

    renderWithContext(<ElevatorCabin elevator={elevator} />, {
      contextOverrides: { setSelectedElevatorId: setSelectedElevatorIdMock },
    });

    const cabin = screen.getByTestId('elevator-cabin-3');
    await user.click(cabin);

    expect(setSelectedElevatorIdMock).toHaveBeenCalledWith(3);
  });

  it('Cửa thang máy bao gồm đầy đủ 2 cánh kim loại trái & phải (door-leaf-left & door-leaf-right)', () => {
    const elevator = createDefaultElevatorSnapshot(1);
    const { container } = renderWithContext(<ElevatorCabin elevator={elevator} />);

    const leftLeaf = container.querySelector('.door-leaf.door-leaf-left');
    const rightLeaf = container.querySelector('.door-leaf.door-leaf-right');

    expect(leftLeaf).toBeInTheDocument();
    expect(rightLeaf).toBeInTheDocument();
  });
});
