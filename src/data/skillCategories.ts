import { SkillCategory } from '../types/character';

// カテゴリを階層化することも検討できますが、まずはフラットなリストで実装します
export const skillCategories: SkillCategory[] = [
  // 回復系
  { id: 'heal_single', name: '単体回復', keywords: ['最もHPが低い味方1キャラ', 'HP回復'] },
  { id: 'heal_multi', name: '範囲回復', keywords: ['範囲内の味方すべて', 'HP回復'] },
  { id: 'heal_all', name: '全体回復', keywords: ['味方全体', 'HP回復'] },
  { id: 'heal_regen', name: '継続HP回復', keywords: ['継続HP回復', 'リジェネ'] },
  { id: 'hp_absorb', name: 'HP吸収', keywords: ['HP吸収'] },

  // TP関連
  { id: 'tp_charge_single', name: '単体TP回復', keywords: ['TPを回復', '最もTPが低い', '最もTPが多い'] },
  { id: 'tp_charge_multi', name: '範囲TP回復', keywords: ['範囲内の味方すべて', 'TPを回復'] },
  { id: "tp_charge_all", name: "全体TP回復", keywords: ["味方全体のTPを", "TPを小回復"] },
  { id: 'tp_regen', name: '継続TP回復', keywords: ['継続TP回復'] },
  { id: 'tp_up', name: 'TP上昇UP', keywords: ['TP上昇'] },
  { id: 'tp_down', name: 'TP減少', keywords: ['TPダウン', 'TPを減少'] },

  // バフ・デバフ
  { id: 'buff_atk_phys', name: '物理攻撃UP', keywords: ['物理攻撃力', 'UP', 'アップ'] },
  { id: 'buff_atk_magic', name: '魔法攻撃UP', keywords: ['魔法攻撃力', 'UP', 'アップ'] },
  { id: 'buff_crit_phys', name: '物理クリUP', keywords: ['物理クリティカル', 'UP', 'アップ'] },
  { id: 'buff_crit_magic', name: '魔法クリUP', keywords: ['魔法クリティカル', 'UP', 'アップ'] },
  { id: 'buff_speed', name: '速度UP', keywords: ['行動速度', 'UP', 'アップ'] },
  { id: 'debuff_def_phys', name: '物理防御DOWN', keywords: ['物理防御力', 'DOWN', 'ダウン'] },
  { id: 'debuff_def_magic', name: '魔法防御DOWN', keywords: ['魔法防御力', 'DOWN', 'ダウン'] },
  
  // スキル種別
  { id: 'union_burst', name: 'ユニオンバースト', keywords: ['union_burst'] }, // キーワードは内部的なキー名を利用
  { id: 'skill_1', name: 'スキル1', keywords: ['skill_1'] },
  { id: 'skill_2', name: 'スキル2', keywords: ['skill_2'] },
];