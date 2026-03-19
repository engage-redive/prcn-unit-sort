// src/components/moveSpecific/CrushGripOptions.tsx
import React from 'react';

interface CrushGripOptionsProps {
  hpPercent: number;
  onHpPercentChange: (value: number) => void;
}

const CrushGripOptions: React.FC<CrushGripOptionsProps> = ({ hpPercent, onHpPercentChange }) => {
  return (
    <div className="bg-gray-700 p-2 rounded-md mt-2">
      <label htmlFor="hpPercent" className="block text-sm font-medium text-white mb-1">
        相手の残りHP割合: {hpPercent}%
      </label>
      <input
        type="range"
        id="hpPercent"
        name="hpPercent"
        min="1"
        max="100"
        value={hpPercent}
        onChange={(e) => onHpPercentChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default CrushGripOptions;