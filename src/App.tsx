// src/App.tsx
import React, { useState, useMemo } from 'react';
import { useUnits } from './hooks/useUnits';
import UnitCard from './components/UnitCard';
import FilterPanel from './components/FilterPanel';
import { Loader2, AlertCircle } from 'lucide-react';
import { SkillCategory } from './types/SkillCategories';
import { UnitElement } from './types/Unit';

function App() {
  const { units, loading, error, getUnitIcon } = useUnits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttackType, setSelectedAttackType] = useState<number | null>(null);
  const [showLimitedOnly, setShowLimitedOnly] = useState(false);
  const [selectedSkillFilters, setSelectedSkillFilters] = useState<Partial<Record<SkillCategory, boolean>>>({});
  const [selectedElement, setSelectedElement] = useState<UnitElement | null>(null);

  const handleSkillFilterChange = (category: SkillCategory, checked: boolean) => {
    setSelectedSkillFilters(prev => ({
      ...prev,
      [category]: checked,
    }));
  };

  const handleElementChange = (element: UnitElement | null) => {
    setSelectedElement(element);
  };

  const activeSkillFilterKeys = useMemo(() => {
    return (Object.keys(selectedSkillFilters) as SkillCategory[]).filter(
      key => selectedSkillFilters[key]
    );
  }, [selectedSkillFilters]);

  const filteredUnits = useMemo(() => {
    // ... (フィルタリングロジックは変更なし) ...
    return units.filter(unit => {
      if (searchTerm && !unit.unit_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedElement !== null && unit.element !== selectedElement) {
        return false;
      }
      if (selectedAttackType !== null && unit.atk_type !== selectedAttackType) {
        return false;
      }
      if (showLimitedOnly && unit.is_limited !== 1) {
        return false;
      }
      if (activeSkillFilterKeys.length > 0) {
        for (const key of activeSkillFilterKeys) {
          if (!unit.skill_flags || !unit.skill_flags[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }, [units, searchTerm, selectedElement, selectedAttackType, showLimitedOnly, activeSkillFilterKeys]);

  // ... (ローディング、エラー表示は変更なし) ...
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-700">キャラクターデータを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">エラーが発生しました</h2>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-2 py-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            プリンセスコネクト！Re:Dive
          </h1>
          <p className="text-lg text-gray-600">キャラクター図鑑</p>
        </header>

        <FilterPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedAttackType={selectedAttackType}
          onAttackTypeChange={setSelectedAttackType}
          showLimitedOnly={showLimitedOnly}
          onLimitedToggle={setShowLimitedOnly}
          totalCount={units.length}
          filteredCount={filteredUnits.length}
          selectedSkillFilters={selectedSkillFilters}
          onSkillFilterChange={handleSkillFilterChange}
          selectedElement={selectedElement}
          onElementChange={handleElementChange}
        />

        {filteredUnits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              条件に一致するキャラクターが見つかりませんでした
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
            {filteredUnits.map(unit => (
              <UnitCard
                key={unit.unit_id}
                unit={unit}
                iconUrl={getUnitIcon(unit.unit_name)}
                activeSkillFilters={activeSkillFilterKeys} // activeSkillFilterKeysを渡す
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;