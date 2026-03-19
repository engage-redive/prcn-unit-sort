import React from 'react';
import { NatureModifier } from '../types';

interface NatureSelectorProps {
  selected: NatureModifier;
  onChange: (nature: NatureModifier) => void;
  disabled?: boolean;
}

const NatureSelector: React.FC<NatureSelectorProps> = ({ selected, onChange, disabled }) => {
  const natures: { value: NatureModifier; label: string }[] = [
    { value: 0.9, label: 'x0.9' },
    { value: 1.0, label: 'x1.0' },
    { value: 1.1, label: 'x1.1' },
  ];

  return (
    <div className="flex space-x-2 my-2">
      {natures.map((nature) => (
        <button
          key={nature.value}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selected === nature.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(nature.value)}
            disabled={disabled}
          >
          {nature.label}
        </button>
      ))}
    </div>
  );
};

export default NatureSelector;