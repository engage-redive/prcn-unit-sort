// src/components/UnitCard.tsx
import React from 'react';
import { Unit, UnitElement, UnitPosition, SkillSourceInfo } from '../types/Unit';
import { SkillCategory } from '../types/SkillCategories';
import { Sword, Zap } from 'lucide-react';

interface UnitCardProps {
  unit: Unit;
  iconUrl: string | null;
  activeSkillFilters: SkillCategory[];
}

const getSkillSourceDisplayName = (source: keyof SkillSourceInfo): string => {
  if (source === 'ub') return 'UB';
  if (source === 's1') return 'S1'; // スキル1 -> S1 に短縮 (スペース節約のため)
  if (source === 's2') return 'S2'; // スキル2 -> S2 に短縮
  return '';
};

// スキル種別ごとの背景色クラスを取得するヘルパー関数
const getSkillSourceBgColor = (source: keyof SkillSourceInfo): string => {
  if (source === 'ub') return 'bg-purple-600 hover:bg-purple-700'; // 紫系
  if (source === 's1') return 'bg-green-500 hover:bg-green-600';   // 緑系
  if (source === 's2') return 'bg-blue-500 hover:bg-blue-600';     // 青系
  return 'bg-gray-500 hover:bg-gray-600'; // デフォルト
};


const UnitCard: React.FC<UnitCardProps> = ({ unit, iconUrl, activeSkillFilters }) => {
  const getAttackTypeIcon = (atkType: number) => {
    switch (atkType) {
      case 1:
        return <Sword className="w-3 h-3 text-red-500 shrink-0" />;
      case 2:
        return <Zap className="w-3 h-3 text-blue-500 shrink-0" />;
      default:
        return null;
    }
  };

  const getElementIconPath = (element: UnitElement): string | null => {
    switch (element) {
      case "火": return "/elementIcon/fire.png";
      case "水": return "/elementIcon/water.png";
      case "風": return "/elementIcon/wind.png";
      case "光": return "/elementIcon/light.png";
      case "闇": return "/elementIcon/dark.png";
      default: return null;
    }
  };

  const getShortPositionName = (position: UnitPosition): string => {
    switch (position) {
      case "前衛": return "前";
      case "中衛": return "中";
      case "後衛": return "後";
      default: return "";
    }
  };

  const getMatchedSkillDetails = (): { category: SkillCategory, skills: { source: keyof SkillSourceInfo, name: string }[] }[] => {
    if (activeSkillFilters.length === 0 || !unit.skill_flags) {
      return [];
    }
    const matchedDetails: { category: SkillCategory, skills: { source: keyof SkillSourceInfo, name: string }[] }[] = [];

    activeSkillFilters.forEach(filterCategory => {
      const sourceInfo = unit.skill_flags[filterCategory];
      if (sourceInfo) {
        const categoryMatchedSkills: { source: keyof SkillSourceInfo, name: string }[] = [];
        if (sourceInfo.ub) {
          categoryMatchedSkills.push({ source: 'ub', name: unit.ub_name || "ユニオンバースト" });
        }
        if (sourceInfo.s1) {
          categoryMatchedSkills.push({ source: 's1', name: unit.skill1_name || "スキル1" });
        }
        if (sourceInfo.s2) {
          categoryMatchedSkills.push({ source: 's2', name: unit.skill2_name || "スキル2" });
        }

        if (categoryMatchedSkills.length > 0) {
          matchedDetails.push({ category: filterCategory, skills: categoryMatchedSkills });
        }
      }
    });
    return matchedDetails;
  };

  const matchedSkillDetailsList = getMatchedSkillDetails();

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col items-center w-full">
      <div className="relative w-20 h-20 aspect-square">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={unit.unit_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.alt-image-placeholder')) {
                target.style.display = 'none';
                const altDiv = document.createElement('div');
                altDiv.className = "alt-image-placeholder w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] p-1 text-center";
                altDiv.textContent = "画像なし";
                parent.appendChild(altDiv);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 text-[10px] p-1 text-center">画像なし</div>
          </div>
        )}
      </div>

      <div className="p-1 w-full flex-grow flex flex-col justify-between">
        <div>
          <h3
            className="font-semibold text-[10px] text-gray-700 text-center truncate leading-tight"
            title={unit.unit_name}
          >
            {unit.unit_name}
          </h3>
          <div className="flex items-center justify-center space-x-1 text-[9px] mt-0.5">
            <div className="flex items-center">
              {getAttackTypeIcon(unit.atk_type)}
            </div>
            {getElementIconPath(unit.element) && (
              <img src={getElementIconPath(unit.element)!} alt={unit.element} className="w-2.5 h-2.5 shrink-0" />
            )}
            <span className="text-gray-500">{getShortPositionName(unit.position)}</span>
          </div>
        </div>

        {matchedSkillDetailsList.length > 0 && (
          <div className="mt-1 pt-1 border-t border-gray-200 text-[8px] text-purple-600 leading-tight px-0.5 space-y-0.5">
            {matchedSkillDetailsList.slice(0, 1).map((detail, index) => (
              <div key={index} className="w-full">
                <div className="text-purple-700 font-medium truncate text-center" title={detail.category}>
                  {detail.category}
                </div>
                {detail.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="mt-0.5 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-full text-white text-[7px] leading-none transition-colors duration-150 ${
                        getSkillSourceBgColor(skill.source) // 背景色を動的に設定
                      }`}
                    >
                      {getSkillSourceDisplayName(skill.source)}
                    </span>
                    <div className="text-gray-600 truncate text-[9px] leading-snug" title={skill.name}>
                      {skill.name}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {matchedSkillDetailsList.length > 1 && <div className="text-center text-[7px]">...他カテゴリ</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCard;