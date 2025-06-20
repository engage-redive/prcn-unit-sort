// src/components/FilterPanel.tsx
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { SkillCategory, SkillCategoriesList } from '../types/SkillCategories';
import { UnitElement } from '../types/Unit';

interface FilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAttackType: number | null;
  onAttackTypeChange: (type: number | null) => void;
  showLimitedOnly: boolean;
  onLimitedToggle: (value: boolean) => void;
  totalCount: number;
  filteredCount: number;
  selectedSkillFilters: Partial<Record<SkillCategory, boolean>>;
  onSkillFilterChange: (category: SkillCategory, checked: boolean) => void;
  selectedElement: UnitElement | null;
  onElementChange: (element: UnitElement | null) => void;
}

const skillFilterGroups: Record<string, SkillCategory[]> = (() => {
  const groups: Record<string, SkillCategory[]> = {
    "HP/TP関連": [],
    "味方強化(攻撃)": [],
    "味方強化(防御/バリア)": [],
    "味方強化(その他)": [],
    "敵弱体化": [],
    "状態異常": [],
    "コントロール": [],
    "ダメージ特性": [],
    "その他特殊効果": [],
  };
  const categorized = new Set<SkillCategory>();
  SkillCategoriesList.forEach(cat => {
    if (cat.includes("HP") || cat.includes("TP") || cat.includes("吸収")) {
      groups["HP/TP関連"].push(cat);
      categorized.add(cat);
    }
  });
  SkillCategoriesList.forEach(cat => {
    if (!categorized.has(cat) && cat.startsWith("味方") && (cat.includes("攻撃力") || cat.includes("クリティカル"))) {
      groups["味方強化(攻撃)"].push(cat);
      categorized.add(cat);
    }
  });
  SkillCategoriesList.forEach(cat => {
    if (!categorized.has(cat) && cat.startsWith("味方") && (cat.includes("防御力") || cat.includes("バリア") || cat.includes("ダメージカット"))) {
      groups["味方強化(防御/バリア)"].push(cat);
      categorized.add(cat);
    }
  });
  SkillCategoriesList.forEach(cat => {
    if (!categorized.has(cat) && cat.startsWith("敵")) {
      groups["敵弱体化"].push(cat);
      categorized.add(cat);
    }
  });
  const statusAilmentKeywords: SkillCategory[] = ["スタン", "麻痺", "束縛", "凍結", "石化", "睡眠", "混乱", "誘惑", "恐慌", "暗闇", "毒/猛毒", "火傷", "呪い/呪詛", "割合ダメージ状態(敵)"];
  statusAilmentKeywords.forEach(keyword => {
    if (SkillCategoriesList.includes(keyword) && !categorized.has(keyword)) {
        groups["状態異常"].push(keyword);
        categorized.add(keyword);
    }
  });
  const controlKeywords: SkillCategory[] = ["吹き飛ばし/ノックバック", "引き寄せ", "挑発", "行動時間停止", "執着"];
  controlKeywords.forEach(keyword => {
    if (SkillCategoriesList.includes(keyword) && !categorized.has(keyword)) {
        groups["コントロール"].push(keyword);
        categorized.add(keyword);
    }
  });
  SkillCategoriesList.forEach(cat => {
    if (!categorized.has(cat) && (cat.includes("ダメージ特性") || cat.includes("クリティカル確定") || cat.includes("必中") || cat.includes("追加ダメージ") || cat.includes("割合ダメージ(スキル直撃)") || cat.includes("防御参照型") || cat.includes("防御力一定値無視"))) {
      groups["ダメージ特性"].push(cat);
      categorized.add(cat);
    }
  });
  const otherSpecialEffectKeywords: SkillCategory[] = ["召喚", "フィールド展開", "行動パターン変化", "スキル効果量変化(条件付き)", "複数回ヒット攻撃", "特定属性味方への追加効果", "特定タイプ敵への追加効果", /*"敵討伐時追加効果",*/ "ダメージでTP回復しない効果"]; // "敵討伐時追加効果" をコメントアウトまたは削除
   otherSpecialEffectKeywords.forEach(keyword => {
    if (SkillCategoriesList.includes(keyword) && !categorized.has(keyword)) {
        groups["その他特殊効果"].push(keyword);
        categorized.add(keyword);
    }
  });
  SkillCategoriesList.forEach(cat => {
    if (!categorized.has(cat) && cat.startsWith("味方")) {
      groups["味方強化(その他)"].push(cat);
      categorized.add(cat);
    }
  });
  return groups;
})();


const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-gray-700 hover:text-purple-600 focus:outline-none"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="mt-3 pl-2 space-y-1">{children}</div>}
    </div>
  );
};

const elementOptions: { value: UnitElement; label: string; icon?: string }[] = [
  { value: "火", label: "火", icon: "/elementIcon/fire.png" },
  { value: "水", label: "水", icon: "/elementIcon/water.png" },
  { value: "風", label: "風", icon: "/elementIcon/wind.png" },
  { value: "光", label: "光", icon: "/elementIcon/light.png" },
  { value: "闇", label: "闇", icon: "/elementIcon/dark.png" },
  { value: "不明", label: "不明" },
];


const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearchChange,
  selectedAttackType,
  onAttackTypeChange,
  showLimitedOnly,
  onLimitedToggle,
  totalCount,
  filteredCount,
  selectedSkillFilters,
  onSkillFilterChange,
  selectedElement,
  onElementChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">フィルター</h2>
        <div className="ml-auto text-sm text-gray-600">
          {filteredCount} / {totalCount} キャラクター
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <label htmlFor="search-term-input" className="block text-sm font-medium text-gray-700">
            キャラクター名
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search-term-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="名前で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="element-select-input" className="block text-sm font-medium text-gray-700">
            属性
          </label>
          <select
            id="element-select-input"
            value={selectedElement || ''}
            onChange={(e) => onElementChange(e.target.value ? e.target.value as UnitElement : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">すべて</option>
            {elementOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="attack-type-select-input" className="block text-sm font-medium text-gray-700">
            攻撃タイプ
          </label>
          <select
            id="attack-type-select-input"
            value={selectedAttackType || ''}
            onChange={(e) => onAttackTypeChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">すべて</option>
            <option value="1">🗡️ 物理</option>
            <option value="2">⚡ 魔法</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            限定キャラ
          </label>
          <label htmlFor="limited-only-checkbox" className="flex items-center space-x-2 cursor-pointer pt-2">
            <input
              id="limited-only-checkbox"
              type="checkbox"
              checked={showLimitedOnly}
              onChange={(e) => onLimitedToggle(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">限定のみ表示</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-700 mt-4 mb-2">スキル詳細フィルター</h3>
        {Object.entries(skillFilterGroups)
          .filter(([_, categories]) => categories.length > 0)
          .map(([groupName, categories]) => (
          <AccordionSection key={groupName} title={groupName}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedSkillFilters[category]}
                    onChange={(e) => onSkillFilterChange(category, e.target.checked)}
                    className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 shrink-0"
                  />
                  <span className="text-xs text-gray-600">{category}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;