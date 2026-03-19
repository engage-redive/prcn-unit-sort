import React from 'react';

interface HitCountSelectProps {
  label: string;
  maxHits: number; // 技のmultihitプロパティの値
  selectedCount: number | null;
  onChange: (count: number) => void;
  disabled?: boolean;
  className?: string;
}

const HitCountSelect: React.FC<HitCountSelectProps> = ({
  label,
  maxHits,
  selectedCount,
  onChange,
  disabled = false,
  className = '',
}) => {
  // maxHitsが1以下（つまり連続攻撃技ではないか、ヒット数が1）の場合は何も表示しない
  if (maxHits <= 1) {
    return null;
  }

  const hitOptions = Array.from({ length: maxHits }, (_, i) => i + 1); // 1からmaxHitsまでの配列を生成

  return (
    <div className={`mt-3 ${className}`}>
      <label htmlFor={`hit-count-select-${label}`} className="block text-sm font-medium text-gray-300 mb-1">
        {label} (1〜{maxHits}回)
      </label>
      <select
        id={`hit-count-select-${label}`}
        value={selectedCount !== null ? selectedCount : ''} // 未選択時は空文字
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (!isNaN(value)) {
            onChange(value);
          }
        }}
        disabled={disabled}
        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md
                    ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <option value="" disabled>回数を選択</option>
        {hitOptions.map(count => (
          <option key={count} value={count}>
            {count}回
          </option>
        ))}
      </select>
    </div>
  );
};

export default HitCountSelect;