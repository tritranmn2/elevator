import React from 'react';

interface FloorNumberProps {
  floor: number;
}

export const FloorNumber: React.FC<FloorNumberProps> = ({ floor }) => {
  const isGround = floor === 1;

  return (
    <div className="floor-label-cell">
      <div className={`floor-number-badge ${isGround ? 'ground' : ''}`} title={`Floor ${floor}`}>
        {floor}F
      </div>
    </div>
  );
};
