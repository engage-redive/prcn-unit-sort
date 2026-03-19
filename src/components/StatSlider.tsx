import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface StatSliderProps {
  label: string;
  value: number; // 現在の努力値 (0, 4, 12, ..., 252 のいずれか)
  max: number;   // スライダーの最大値 (通常は252)
  onChange: (value: number) => void;
  realValue?: number;
  effortValue?: number;
  currentStat?: number;
  disabled?: boolean;
}

const StatSlider: React.FC<StatSliderProps> = ({
  label,
  value,
  max, // ポケモンの努力値の場合、このmaxは252を想定
  onChange,
  realValue,
  effortValue,
  currentStat,
  disabled
}) => {
  // スライダーの値を最も近い有効なステータスポイントに丸める関数
  const getValidStatPoint = (val: number): number => {
    return Math.max(0, Math.min(Math.round(val), max));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(getValidStatPoint(newValue));
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return; // max は通常252

    let nextValue = value + 1;
    onChange(Math.min(nextValue, max)); // maxを超えないように
  };

  const handleDecrement = () => {
    if (disabled || value <= 0) return;

    let prevValue = value - 1;
    onChange(Math.max(prevValue, 0)); // 0未満にならないように
  };

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="text-white font-medium text-sm">{label}</div>
        {(realValue !== undefined || currentStat !== undefined) && <div className="text-white font-bold">{realValue ?? currentStat}</div>}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          disabled={disabled}
          className={`p-1 rounded-full bg-gray-700 text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          aria-label={`Decrement ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max={max} // スライダーのUI上の最大値 (努力値では252)
            value={value} // 現在の努力値
            onChange={handleSliderChange}
            disabled={disabled}
            className={`w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : '[&::-webkit-slider-thumb]:hover:bg-blue-400'}`}
            aria-label={`${label} slider`}
          />
          {/* スライダーのトラックの wypełniona część */}
          <div 
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full pointer-events-none"
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={disabled}
          className={`p-1 rounded-full bg-gray-700 text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          aria-label={`Increment ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0</span>
        {effortValue !== undefined && <span className="text-white font-bold">{effortValue}</span>}
        <span>{max}</span>
      </div>
    </div>
  );
};

export default StatSlider;