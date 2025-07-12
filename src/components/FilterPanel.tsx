import React, { useState } from 'react';
import { FilterOptions, SkillFilter } from '../types/character';
import { skillFilterOptions } from '../data/skillFilterOptions';
import { characterRoles } from '../data/role';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount
}) => {
  const [isSkillFilterOpen, setIsSkillFilterOpen] = useState(false);

  const elements = ['火', '水', '風', '光', '闇'];
  const positions = ['前衛', '中衛', '後衛'];
  const atkTypes = ['物理', '魔法'];

  const handleBasicCheckboxChange = (key: 'element' | 'position' | 'atkType' | 'roles', value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleSkillCheckboxChange = (filter: SkillFilter) => {
    const currentFilters = filters.skillFilters;
    const newFilters = currentFilters.some(f => f.id === filter.id)
      ? currentFilters.filter(f => f.id !== filter.id)
      : [...currentFilters, filter];
    onFiltersChange({ ...filters, skillFilters: newFilters });
  };
  
  const clearAllFilters = () => {
    onFiltersChange({
      element: [],
      position: [],
      atkType: [],
      roles: [],
      skillFilters: [],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">フィルター</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {filteredCount} / {totalCount} キャラクター
          </span>
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">属性</h3>
          {elements.map(el => (
            <label key={el} className="flex items-center text-sm"><input type="checkbox" checked={filters.element.includes(el)} onChange={() => handleBasicCheckboxChange('element', el)} className="mr-2" />{el}</label>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">配置</h3>
          {positions.map(pos => (
            <label key={pos} className="flex items-center text-sm"><input type="checkbox" checked={filters.position.includes(pos)} onChange={() => handleBasicCheckboxChange('position', pos)} className="mr-2" />{pos}</label>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">攻撃タイプ</h3>
          {atkTypes.map(type => (
            <label key={type} className="flex items-center text-sm"><input type="checkbox" checked={filters.atkType.includes(type)} onChange={() => handleBasicCheckboxChange('atkType', type)} className="mr-2" />{type}</label>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">ロール</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {characterRoles.map(role => (
              <label key={role} className="flex items-center text-sm"><input type="checkbox" checked={filters.roles.includes(role)} onChange={() => handleBasicCheckboxChange('roles', role)} className="mr-2" />{role}</label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <button
          onClick={() => setIsSkillFilterOpen(!isSkillFilterOpen)}
          className="flex justify-between items-center w-full text-left font-bold text-lg text-gray-800"
        >
          <span>スキル詳細フィルター</span>
          {isSkillFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isSkillFilterOpen && (
          // ★ 表示列数を増やして見やすくする
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
            {skillFilterOptions.map(group => (
              <div key={group.name}>
                <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">{group.name}</h3>
                <div className="space-y-1">
                  {group.filters.map(filter => (
                    <label key={filter.id} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.skillFilters.some(f => f.id === filter.id)}
                        onChange={() => handleSkillCheckboxChange(filter)}
                        className="mr-2"
                      />
                      {filter.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;