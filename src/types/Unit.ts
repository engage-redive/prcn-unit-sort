// src/types/Unit.ts
import { SkillCategory } from './SkillCategories';

export type UnitElement = "火" | "水" | "風" | "光" | "闇" | "不明";
export type UnitPosition = "前衛" | "中衛" | "後衛" | "不明";

// どのスキルソースでカテゴリがヒットしたかを記録する型
export interface SkillSourceInfo {
  ub?: boolean;
  s1?: boolean;
  s2?: boolean;
}

export interface Unit {
  unit_id: number;
  unit_name: string;
  comment: string; // UB説明 or スキル1 or スキル2 (現状のまま)
  only_disp_owned: number;
  start_time: string;
  end_time: string;
  is_limited: number;
  rarity: number;
  motion_type: number;
  se_type: number;
  move_speed: number;
  search_area_width: number;
  atk_type: number; // 1: 物理, 2: 魔法
  normal_atk_cast_time: number;
  cutin: number;
  cutin_star6: number;
  visual_change_flag: number;
  prefab_id: number;
  prefab_id_battle: number;
  multiple_unit_id: number;
  exchange_id: number;
  actual_name: string;
  kana: string;
  guild_id: number;
  exskill_display: number;
  comment_2: string; // スキル1 or スキル2 (現状のまま)
  only_disp_owned_2: number;
  start_time_2: string;
  end_time_2: string;
  original_unit_id: number;

  // スキル説明
  ub_description: string;
  skill1_description: string;
  skill2_description: string;

  // スキル名を追加
  ub_name: string;
  skill1_name: string;
  skill2_name: string;

  // skill_flagsの型を変更
  skill_flags: Partial<Record<SkillCategory, SkillSourceInfo>>;

  // 属性と配置
  element: UnitElement;
  position: UnitPosition;
}

export interface UnitIconEntry {
  name: string;
  idStar1: number;
  idStar3: number;
  idStar6: number;
}