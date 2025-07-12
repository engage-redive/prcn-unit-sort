import { SkillFilter } from '../types/character';

export interface FilterGroup {
  name: string;
  filters: (SkillFilter & { label: string })[];
}

export const skillFilterOptions: FilterGroup[] = [
  {
    name: '効果タイプ (バフ)',
    filters: [
      { id: 'type_buff_atk_phys', label: '物理攻撃UP', property: 'type', value: '物理攻撃力UP' },
      { id: 'type_buff_atk_magic', label: '魔法攻撃UP', property: 'type', value: '魔法攻撃力UP' },
      { id: 'type_buff_def_phys', label: '物理防御UP', property: 'type', value: '物理防御力UP' },
      { id: 'type_buff_def_magic', label: '魔法防御UP', property: 'type', value: '魔法防御力UP' },
      { id: 'type_buff_crit_phys', label: '物理クリティカルUP', property: 'type', value: '物理クリティカルUP' },
      { id: 'type_buff_crit_magic', label: '魔法クリティカルUP', property: 'type', value: '魔法クリティカルUP' },
      { id: 'type_buff_crit_dmg_phys', label: '物理クリダメUP', property: 'type', value: '物理攻撃クリティカルダメージUP' },
      { id: 'type_buff_crit_dmg_magic', label: '魔法クリダメUP', property: 'type', value: '魔法攻撃クリティカルダメージUP' },
      { id: 'type_buff_speed', label: '行動速度UP', property: 'type', value: '行動速度UP' },
      { id: 'type_buff_tp_up', label: 'TP上昇UP', property: 'type', value: 'TP上昇UP' },
      { id: 'type_buff_hp_absorb', label: 'HP吸収UP', property: 'type', value: 'HP吸収UP' },
    ],
  },
  {
    name: '効果タイプ (デバフ)',
    filters: [
      { id: 'type_debuff_atk_phys', label: '物理攻撃DOWN', property: 'type', value: '物理攻撃力DOWN' },
      { id: 'type_debuff_atk_magic', label: '魔法攻撃DOWN', property: 'type', value: '魔法攻撃力DOWN' },
      { id: 'type_debuff_def_phys', label: '物理防御DOWN', property: 'type', value: '物理防御力DOWN' },
      { id: 'type_debuff_def_magic', label: '魔法防御DOWN', property: 'type', value: '魔法防御力DOWN' },
      { id: 'type_debuff_speed', label: '行動速度DOWN', property: 'type', value: '行動速度DOWN' },
      { id: 'type_debuff_tp_down', label: 'TP減少', property: 'type', value: 'TP DOWN' },
    ],
  },
  {
    name: '効果タイプ (回復)',
    filters: [
        { id: 'type_heal_hp', label: 'HP回復', property: 'type', value: 'HP回復' },
        { id: 'type_heal_tp', label: 'TP回復', property: 'type', value: 'TP回復' },
        { id: 'type_heal_hp_regen', label: '継続HP回復', property: 'type', value: '継続HP回復' },
        { id: 'type_heal_tp_regen', label: '継続TP回復', property: 'type', value: '継続TP回復' },
    ],
  },
  // ★ ここから新しいフィルターグループを追加
  {
    name: '状態異常・妨害',
    filters: [
      { id: 'type_ailment_stun', label: 'スタン', property: 'type', value: 'スタン' },
      { id: 'type_ailment_bind', label: '束縛', property: 'type', value: '束縛' },
      { id: 'type_ailment_paralysis', label: '麻痺', property: 'type', value: '麻痺' },
      { id: 'type_ailment_freeze', label: '凍結', property: 'type', value: '凍結' },
      { id: 'type_ailment_petrify', label: '石化', property: 'type', value: '石化' },
      { id: 'type_ailment_knockback', label: '吹き飛ばし', property: 'type', value: '吹き飛ばし' },
      { id: 'type_ailment_pull', label: '引き寄せ', property: 'type', value: '引き寄せ' },
      { id: 'type_ailment_confusion', label: '混乱', property: 'type', value: '混乱' },
      { id: 'type_ailment_charm', label: '誘惑', property: 'type', value: '誘惑' },
      { id: 'type_ailment_fear', label: '恐慌', property: 'type', value: '恐慌' },
      { id: 'type_ailment_darkness', label: '暗闇', property: 'type', value: '暗闇' },
    ],
  },
  {
    name: '継続ダメージ',
    filters: [
      { id: 'type_dot_poison', label: '毒・猛毒', property: 'type', value: '毒' },
      { id: 'type_dot_burn', label: '火傷', property: 'type', value: '火傷' },
      { id: 'type_dot_curse', label: '呪い・呪詛', property: 'type', value: '呪い' },
      { id: 'type_dot_percent', label: '割合ダメージ', property: 'type', value: '割合ダメージ' },
    ]
  },
  // ★ ここまで
  {
    name: 'その他',
    filters: [
      { id: 'type_barrier_phys', label: '物理バリア', property: 'type', value: '物理無効バリア' },
      { id: 'type_barrier_magic', label: '魔法バリア', property: 'type', value: '魔法無効バリア' },
      { id: 'type_barrier_absorb', label: '吸収バリア', property: 'type', value: '吸収バリア' },
      { id: 'type_field', label: 'フィールド展開', property: 'type', value: 'フィールド' },
    ]
  },
  {
    name: 'ターゲット',
    filters: [
      { id: 'target_self', label: '自分', property: 'target', value: '自分', matchType: 'exact' },
      { id: 'target_enemy_single', label: '敵単体', property: 'target', value: '敵1キャラ' },
      { id: 'target_enemy_all', label: '敵全体', property: 'target', value: '敵全体' },
      { id: 'target_enemy_range', label: '敵範囲', property: 'target', value: '範囲内の敵' },
      { id: 'target_ally_single', label: '味方単体', property: 'target', value: '味方1キャラ' },
      { id: 'target_ally_all', label: '味方全体', property: 'target', value: '味方全体' },
      { id: 'target_ally_range', label: '味方範囲', property: 'target', value: '範囲内の味方' },
    ],
  },
  {
    name: '効果時間',
    filters: [
      { id: 'duration_12s', label: '約12秒', property: 'duration', value: 12, matchType: 'exact' },
      { id: 'duration_18s', label: '約18秒', property: 'duration', value: 18, matchType: 'exact' },
      { id: 'duration_permanent', label: '永続/時間制限なし', property: 'duration', value: null, matchType: 'exact' },
    ],
  },
  {
    name: '参照ステータス (効果量)',
    filters: [
      { id: 'formula_hp', label: 'HP参照', property: 'formula', value: 'HP' },
      { id: 'formula_atk_phys', label: '物理攻撃力参照', property: 'formula', value: '物理攻撃力' },
      { id: 'formula_atk_magic', label: '魔法攻撃力参照', property: 'formula', value: '魔法攻撃力' },
      { id: 'formula_def_phys', label: '物理防御力参照', property: 'formula', value: '物理防御力' },
    ],
  },
];