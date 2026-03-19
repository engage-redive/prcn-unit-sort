import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface RankSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const RankSelector: React.FC<RankSelectorProps> = ({ value, onChange, label, disabled = false }) => {
  const handleIncrement = () => {
    if (value < 6) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > -6) {
      onChange(value - 1);
    }
  };

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          disabled={disabled || value <= -6}
          className="p-1.5 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <div className="px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-white text-center min-w-[60px]">
          {value > 0 ? `+${value}` : value}
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={disabled || value >= 6}
          className="p-1.5 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RankSelector;