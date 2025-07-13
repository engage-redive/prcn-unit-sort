import React from 'react';
import { RankItem } from '../types/character';
import { getIconPath } from '../utils/characterUtils';
import { Star, Swords, Shield, Zap } from 'lucide-react'; // Zapを追加

interface RankingListProps {
  data: RankItem[];
  selectedRanking: string; // ★ propsにselectedRankingを追加
}

const getSkillIconComponent = (iconName: string) => {
    switch (iconName) {
        case 'ub':
            return <Star className="w-5 h-5 text-yellow-500" />;
        case 'skill':
            return <Swords className="w-5 h-5 text-red-500" />;
        case 'special': // 特殊スキル用のアイコン
            return <Zap className="w-5 h-5 text-purple-500" />;
        case 'buff':
            return <Shield className="w-5 h-5 text-green-500" />;
        default:
            return null;
    }
}

const getSkillTypeDisplayName = (skillType: string) => {
    switch (skillType) {
        case 'union_burst':
            return 'UB';
        case 'skill_1':
            return 'スキル1';
        case 'skill_2':
            return 'スキル2';
        case 'special_skill_1':
            return '特殊スキル';
        default:
            return skillType; // フォールバック
    }
}

const RankingList: React.FC<RankingListProps> = ({ data, selectedRanking }) => {
  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500">この条件のランキングデータはありません。</div>;
  }

  const isSpeedRanking = selectedRanking === 'speed_buff';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">順位</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">キャラクター</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スキル</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">効果量</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            const displayValue = isSpeedRanking 
              ? `${item.value.toLocaleString()}%`
              : item.value.toLocaleString();

            return (
              <tr key={`${item.characterId}-${item.skillName}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-bold text-gray-700">{index + 1}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img className="h-12 w-12 rounded-full object-cover" src={getIconPath({ fullName: item.characterFullName, name: item.characterName } as any)} alt={item.characterName} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.characterFullName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    {getSkillIconComponent(item.skillIcon)}
                    <span>{item.skillName}</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-lg font-semibold text-blue-600">
                  {displayValue}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                  <span className="font-semibold">{getSkillTypeDisplayName(item.skillType)}:</span> {item.details}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RankingList;