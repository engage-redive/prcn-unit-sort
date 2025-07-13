export interface Character {
  id: string;
  name: string;
  version: string;
  fullName: string;
  rarity: number;
  position: string;
  type: string;
  attribute: string;
  roles: string[];
  releaseDate: string;
  acquisitionMethod: string;
  skills: {
    unionBurst: { name: string; description: string; };
    skill1: { name: string; description: string; };
    skill2: { name: string; description: string; };
  };
}

export interface Effect {
  target: string;
  type: string;
  formula: string | null;
  duration: number | null;
  condition?: string;
  note?: string;
  duration_formula?: string;
  field_effects?: FieldEffect[];
}

export interface FieldEffect {
    type: string;
    formula: string;
}

export interface SkillVersion {
  version_id: string;
  name: string;
  description: string;
  effects: Effect[];
  note?: string;
}

export interface SkillDetail {
  base_name?: string;
  versions: SkillVersion[];
}

export interface UnitSkills {
  [characterFullName: string]: {
    union_burst?: SkillDetail;
    skill_1?: SkillDetail;
    skill_2?: SkillDetail;
    special_skill_1?: SkillDetail;
    skill_1_normal?: SkillDetail;
    skill_2_normal?: SkillDetail;
    skill_1_overdrive?: SkillDetail;
    skill_2_overdrive?: SkillDetail;
    [key: string]: SkillDetail | undefined;
  };
}

// 新しいスキルフィルターの型
export interface SkillFilter {
  id: string;
  property: keyof Effect | 'description';
  value: string | number | null;
  matchType?: 'exact' | 'contains';
}

// FilterOptionsの型を更新
export interface FilterOptions {
  element: string[];
  position: string[];
  atkType: string[];
  roles: string[];
  skillFilters: SkillFilter[];
}

// ランキングの各項目を表す型
export interface RankItem {
  characterId: string;
  characterName: string;
  characterFullName: string;
  skillName: string;
  skillIcon: string; // React.ReactNode から string へ変更
  value: number;
  details: string;
  skillType: string; // スキルの種類 (UB, skill_1など)
}

// ランキング計算関数の型
export type RankingCalculator = (
  characters: Character[],
  skills: UnitSkills,
  level: number,
  phyAtk: number,
  magAtk: number
) => RankItem[];

// ランキングカテゴリの定義
export interface RankingCategory {
  id: string;
  name: string;
  calculator: RankingCalculator;
}