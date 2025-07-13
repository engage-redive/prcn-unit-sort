import React from 'react';

interface RankingOption {
  id: string;
  name: string;
}

interface RankingPanelProps {
  level: number;
  phyAtk: number;
  magAtk: number;
  onLevelChange: (value: number) => void;
  onPhyAtkChange: (value: number) => void;
  onMagAtkChange: (value: number) => void;
  selectedRanking: string;
  onRankingChange: (id: string) => void;
  rankingOptions: RankingOption[];
}

const RankingPanel: React.FC<RankingPanelProps> = ({
  level,
  phyAtk,
  magAtk,
  onLevelChange,
  onPhyAtkChange,
  onMagAtkChange,
  selectedRanking,
  onRankingChange,
  rankingOptions,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">ランキング設定</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レベル
          </label>
          <input
            type="number"
            value={level}
            onChange={(e) => onLevelChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物理攻撃力
          </label>
          <input
            type="number"
            value={phyAtk}
            onChange={(e) => onPhyAtkChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            魔法攻撃力
          </label>
          <input
            type="number"
            value={magAtk}
            onChange={(e) => onMagAtkChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ランキング種類
        </label>
        <select
          value={selectedRanking}
          onChange={(e) => onRankingChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {rankingOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RankingPanel;