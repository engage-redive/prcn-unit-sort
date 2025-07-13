import React, { useState, useMemo } from 'react';
import { Character, UnitSkills } from '../types/character';
import { rankingCalculators } from '../utils/rankingUtils';
import RankingPanel from '../components/RankingPanel'; // ★ このパスが正しいか確認
import RankingList from '../components/RankingList';   // ★ このパスが正しいか確認

interface RankingsPageProps {
  characters: Character[];
  skills: UnitSkills;
}

// ★ ランキングの選択肢を追加
const rankingOptions = [
  { id: 'single_phys_damage', name: '単体物理ダメージ (UB)' },
  { id: 'single_magic_damage', name: '単体魔法ダメージ (UB)' },
  { id: 'area_phys_damage', name: '範囲/全体物理ダメージ (UB)' },
  { id: 'area_magic_damage', name: '範囲/全体魔法ダメージ (UB)' },
  { id: 'single_heal', name: '単体HP回復 (UB)' },
  { id: 'area_heal', name: '範囲/全体HP回復 (UB)' },
  { id: 'single_phys_atk_buff', name: '単体物理攻撃バフ' },
  { id: 'area_phys_atk_buff', name: '全体物理攻撃バフ' },
  { id: 'single_magic_atk_buff', name: '単体魔法攻撃バフ' },
  { id: 'area_magic_atk_buff', name: '全体魔法攻撃バフ' },
  { id: 'phys_def_debuff', name: '物理防御デバフ' },
  { id: 'magic_def_debuff', name: '魔法防御デバフ' },
  // ★ ここから追加
  { id: 'single_tp_charge', name: '単体TP回復' },
  { id: 'area_tp_charge', name: '範囲/全体TP回復' },
  { id: 'tp_boost', name: 'TP上昇バフ' },
  { id: 'speed_buff', name: '行動速度バフ' },
];

const RankingsPage: React.FC<RankingsPageProps> = ({ characters, skills }) => {
  const [level, setLevel] = useState(356);
  const [phyAtk, setPhyAtk] = useState(70000);
  const [magAtk, setMagAtk] = useState(70000);
  const [selectedRanking, setSelectedRanking] = useState<keyof typeof rankingCalculators>('single_phys_damage');

  const rankedData = useMemo(() => {
    const calculator = rankingCalculators[selectedRanking];
    return calculator ? calculator(characters, skills, level, phyAtk, magAtk) : [];
  }, [selectedRanking, characters, skills, level, phyAtk, magAtk]);

  return (
    <div>
      <RankingPanel
        level={level}
        phyAtk={phyAtk}
        magAtk={magAtk}
        onLevelChange={setLevel}
        onPhyAtkChange={setPhyAtk}
        onMagAtkChange={setMagAtk}
        selectedRanking={selectedRanking}
        onRankingChange={(id) => setSelectedRanking(id as keyof typeof rankingCalculators)}
        rankingOptions={rankingOptions}
      />
      <RankingList data={rankedData} />
    </div>
  );
};

export default RankingsPage;