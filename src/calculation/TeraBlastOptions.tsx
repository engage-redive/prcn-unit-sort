import React, { useState } from 'react';
import { PokemonType, MoveCategory } from '../types';
import { POKEMON_TYPE_NAMES_JP } from './pokemonTypesJp';
import { ChevronDown } from 'lucide-react';

interface TeraBlastOptionsProps {
  teraType: PokemonType | null;
  isStellar: boolean;
  userSelectedCategory: 'physical' | 'special' | 'auto';
  determinedCategory: MoveCategory | null;
  isEnabled: boolean; // Attacker is enabled/disabled
  onTeraTypeChange: (type: PokemonType) => void;
  onCategorySelect: (category: 'physical' | 'special' | 'auto') => void;
}

const TeraBlastOptions: React.FC<TeraBlastOptionsProps> = ({
  teraType,
  isStellar,
  userSelectedCategory,
  determinedCategory,
  isEnabled,
  onTeraTypeChange,
  onCategorySelect,
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);

  const toggleTypeDropdown = () => {
    if (!isStellar && isEnabled) { // Dropdown is only for non-Stellar and when enabled
      setIsTypeDropdownOpen(prev => !prev);
    }
  };

  const handleLocalTeraBlastTypeSelect = (type: PokemonType) => {
    if (isEnabled) {
      onTeraTypeChange(type); // Propagate the change
      setIsTypeDropdownOpen(false); // Close dropdown
    }
  };

  return (
    <div className="mt-4 p-3 bg-gray-700 rounded-md">
      <h4 className="text-md font-semibold text-white mb-3">テラバースト設定</h4>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">技タイプ:</label>
        <div className="relative">
          <button
            onClick={toggleTypeDropdown}
            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white flex items-center justify-between disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isStellar || !isEnabled}
          >
            <span>{isStellar ? 'ステラ' : (teraType ? POKEMON_TYPE_NAMES_JP[teraType] : 'タイプを選択')}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {isTypeDropdownOpen && !isStellar && isEnabled && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {Object.entries(POKEMON_TYPE_NAMES_JP).map(([typeValue, name]) => (
                <button
                  key={typeValue}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                  onClick={() => handleLocalTeraBlastTypeSelect(typeValue as PokemonType)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">攻撃カテゴリ:</label>
        <div className="flex gap-2 flex-wrap">
          {(['auto', 'physical', 'special'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => isEnabled && onCategorySelect(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed
                ${userSelectedCategory === cat
                ? (cat === 'physical' ? 'bg-orange-500 text-white' : cat === 'special' ? 'bg-purple-500 text-white' : 'bg-teal-500 text-white')
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
              disabled={!isEnabled}
            >
              {cat === 'auto' ? '自動(攻/特攻高い方)' : cat === 'physical' ? '物理' : '特殊'}
            </button>
          ))}
        </div>
        {determinedCategory && (
          <p className="text-xs text-gray-400 mt-1">
            計算時カテゴリ: {determinedCategory === 'physical' ? '物理' : '特殊'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TeraBlastOptions;