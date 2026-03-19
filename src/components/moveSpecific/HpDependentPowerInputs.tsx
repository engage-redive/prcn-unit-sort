// HpDependentPowerInputs.tsx の修正版（全文）

import React from 'react';

interface HpDependentPowerInputsProps {
  actualMaxHp: number;
  currentHp: number;
  baseMovePower: number;
  onCurrentHpChange: (newHp: number) => void;
  isEnabled: boolean;
}

const HpDependentPowerInputs: React.FC<HpDependentPowerInputsProps> = ({
  actualMaxHp,
  currentHp,
  baseMovePower,
  onCurrentHpChange,
  isEnabled,
}) => {
  const calculateMovePower = () => {
    if (actualMaxHp === 0) return 0;
    const power = Math.floor((baseMovePower * currentHp) / actualMaxHp);
    return Math.max(1, power); // 最低威力は1
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCurrentHpChange(Number(event.target.value));
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="currentHpSlider" className="text-sm font-medium text-white">
          現在のHP: {currentHp} / {actualMaxHp}
        </label>
      </div>
      <input
        type="range"
        id="currentHpSlider"
        min="0"
        max={actualMaxHp}
        value={currentHp}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        disabled={!isEnabled || actualMaxHp === 0}
      />
      <div className="mt-2 text-sm text-white">
        <p>HP割合: {actualMaxHp > 0 ? ((currentHp / actualMaxHp) * 100).toFixed(1) : '0.0'}%</p>
        <p>ふんか/しおふき/ドラゴンエナジーの威力: {calculateMovePower()}</p> 
      </div>
    </div>
  );
};

export default HpDependentPowerInputs;