// src/components/StatSlider.tsx
// PointerEvents API を使ったカスタムスライダー（AttackerPanel / DefenderPanel 用）

import React, { useRef, useCallback } from 'react';

interface StatSliderProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  realValue?: number;
  effortValue?: number;
  currentStat?: number;
  disabled?: boolean;
}

const StatSlider: React.FC<StatSliderProps> = ({
  label,
  value,
  max,
  onChange,
  realValue,
  effortValue,
  currentStat,
  disabled,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const valueFromPointer = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return clamp(Math.round(ratio * max), 0, max);
    },
    [value, max]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    const newVal = valueFromPointer(e.clientX);
    if (newVal !== value) onChange(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || disabled) return;
    const newVal = valueFromPointer(e.clientX);
    if (newVal !== value) onChange(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(Math.min(value + 1, max));
  };

  const handleDecrement = () => {
    if (disabled || value <= 0) return;
    onChange(Math.max(value - 1, 0));
  };

  const fillPct = max > 0 ? (clamp(value, 0, max) / max) * 100 : 0;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="text-white font-medium text-sm">{label}</div>
        {(realValue !== undefined || currentStat !== undefined) && (
          <div className="text-white font-bold">{realValue ?? currentStat}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* デクリメントボタン */}
        <button
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-base leading-none"
          aria-label={`${label} を減らす`}
        >
          −
        </button>

        {/* カスタムトラック */}
        <div
          ref={trackRef}
          className={`relative flex-1 h-5 flex items-center rounded-full cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div className="absolute inset-0 rounded-full bg-gray-700" />
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full bg-blue-500"
            style={{ width: `${fillPct}%` }}
          />
          <div
            className="absolute w-5 h-5 rounded-full bg-blue-400 shadow-md border-2 border-white"
            style={{ left: `calc(${fillPct}% - 10px)` }}
          />
        </div>

        {/* インクリメントボタン */}
        <button
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-base leading-none"
          aria-label={`${label} を増やす`}
        >
          ＋
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