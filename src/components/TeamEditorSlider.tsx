import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface StatSliderProps {
  label: string;
  value: number;               // 現在の努力値 (0-252)
  fixedMax: number;            // スライダーの視覚的な最大値、常に252
  actualMaxValue: number;      // このスライダーが現在操作で到達できる最大値
  onChange: (requestedValue: number) => void;
  className?: string;
  sliderHeight?: string;
}

const StatSlider: React.FC<StatSliderProps> = ({
  label,
  value,
  fixedMax, // 常に252が渡される想定
  actualMaxValue, // このスライダーが現在取りうる上限値
  onChange,
  className,
  sliderHeight = 'h-2',
}) => {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(e.target.value, 10);
    // 要求された値が、現在の操作上の上限 (actualMaxValue) を超えている場合は、actualMaxValue に丸める
    if (newValue > actualMaxValue) {
      newValue = actualMaxValue;
    }
    // ただし、ユーザーが値を減らそうとしている場合はそのまま通す
    // (actualMaxValue は増加方向の制限であり、減少は常に許可されるべき)
    // このロジックは親コンポーネントの handleEvChange で最終決定されるため、
    // ここでは素直にユーザーの意図した値（またはactualMaxValueでクリップした値）を渡す
    onChange(newValue);
  };

  const handleIncrement = () => {
    if (value >= actualMaxValue) return; // 現在の値が既に操作上の上限なら何もしない

    let nextPotentialValue = value + 1; // 次の有効ステップ候補
    // 次の候補が操作上の上限を超える場合は、上限値にする
    onChange(Math.min(nextPotentialValue, actualMaxValue));
  };

  const handleDecrement = () => {
    if (value <= 0) return;

    let prevPotentialValue = value - 1;
    onChange(Math.max(prevPotentialValue, 0)); // 0未満にはしない
  };

  // 塗りつぶしは、常に fixedMax (252) を基準に計算
  const fillPercentage = fixedMax > 0 ? (Math.min(value, fixedMax) / fixedMax) * 100 : 0;

  const shouldHideInternalLabels = className?.includes("hide-stat-slider-real-value");

  // input type="range" の value は、実際のデータモデルの value を反映する
  // ただし、ユーザーがドラッグした際、onChange で actualMaxValue による制限がかかる
  const displayValue = Math.min(value, fixedMax); // 表示上のvalueはfixedMaxを超えない

  return (
    <div className={`w-full ${className || ''}`}>
      {!shouldHideInternalLabels && label && (
        <div className="flex justify-between items-center mb-1">
          <div className="text-white font-medium text-sm">{label}</div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          className="p-1 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Decrement ${label || 'value'}`}
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <div className="flex-1 relative" style={{ touchAction: 'pan-y' }}> {/* 修正点1: touch-action を適用 */}
          <input
            type="range"
            min="0"
            max={fixedMax} // HTMLのmaxは常に252
            value={displayValue} // 表示する値
            onChange={handleSliderChange}
            // スライダーのつまみが actualMaxValue を超えてドラッグできないようにする
            // CSSやJavaScriptでの追加制御が必要になる場合があるが、
            // HTML標準だけでは難しい。onChangeでの値制御が主。
            className={`w-full ${sliderHeight} bg-gray-600 rounded-full appearance-none cursor-pointer 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-blue-500 
                        [&::-webkit-slider-thumb]:hover:bg-blue-400 
                        [&::-webkit-slider-thumb]:transition-colors
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-blue-500
                        [&::-moz-range-thumb]:hover:bg-blue-400
                        [&::-moz-range-thumb]:border-none
                        `}
            aria-label={`${label || 'value'} slider`}
            // disabled={value >= actualMaxValue && value > 0} // 増加方向への操作を制限したいが、ドラッグ自体はできてしまう
          />
         <div 
            className={`absolute top-0 left-0 ${sliderHeight} bg-blue-500 rounded-full pointer-events-none`}
            style={{ width: `${fillPercentage}%` }}
          />
          {/* 擬似的なDisabled Track の表示は不要なのでコメントアウトまたは削除のまま */}
        </div>
        
        <button
          onClick={handleIncrement}
          className="p-1 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Increment ${label || 'value'}`}
          disabled={value >= actualMaxValue} // 操作上の上限に達したら非活性
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      {!shouldHideInternalLabels && label && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>{fixedMax}</span>
        </div>
      )}
    </div>
  );
};

export default StatSlider;