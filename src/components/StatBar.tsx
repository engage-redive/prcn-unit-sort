// src/components/StatBar.tsx
// PointerEvents API を使ったカスタムスライダー。
// HTML range input の代わりに使用し、スマホでのドラッグを正確かつ快適に扱う。

import React, { useRef, useCallback } from 'react';

interface StatBarProps {
  /** 現在値 (0 〜 fixedMax) */
  value: number;
  /** スライダーの視覚的最大値 (固定、通常 32) */
  fixedMax: number;
  /** 現在操作で達成できる最大値 (残りポイントによる上限) */
  actualMaxValue: number;
  onChange: (value: number) => void;
  /** バーの塗り色 (tailwind bg-* クラス) */
  barColor?: string;
  /** 残りポイント上限ゾーンの色 (tailwind bg-* クラス) */
  limitColor?: string;
  disabled?: boolean;
  className?: string;
}

const StatBar: React.FC<StatBarProps> = ({
  value,
  fixedMax,
  actualMaxValue,
  onChange,
  barColor = 'bg-blue-500',
  limitColor = 'bg-blue-900',
  disabled = false,
  className,
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
      const raw = Math.round(ratio * fixedMax);
      return clamp(raw, 0, actualMaxValue);
    },
    [value, fixedMax, actualMaxValue]
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

  const fillPct = fixedMax > 0 ? (clamp(value, 0, fixedMax) / fixedMax) * 100 : 0;
  const limitPct = fixedMax > 0 ? (clamp(actualMaxValue, 0, fixedMax) / fixedMax) * 100 : 0;
  const thumbPos = fillPct; // same percentage as fill

  return (
    <div
      ref={trackRef}
      className={`relative h-5 flex items-center cursor-pointer select-none rounded-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className ?? ''}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={fixedMax}
    >
      {/* Track background */}
      <div className="absolute inset-0 rounded-full bg-gray-700" />

      {/* Available range zone (up to actualMaxValue) */}
      {actualMaxValue > value && (
        <div
          className={`absolute top-0 bottom-0 rounded-full ${limitColor} opacity-40`}
          style={{ left: `${fillPct}%`, width: `${limitPct - fillPct}%` }}
        />
      )}

      {/* Filled portion */}
      <div
        className={`absolute top-0 bottom-0 left-0 rounded-full ${barColor}`}
        style={{ width: `${fillPct}%` }}
      />

      {/* Thumb */}
      <div
        className={`absolute w-5 h-5 rounded-full shadow-md border-2 border-white ${barColor} transition-transform duration-75 ${!disabled ? 'active:scale-125' : ''}`}
        style={{ left: `calc(${thumbPos}% - 10px)` }}
      />
    </div>
  );
};

export default StatBar;
