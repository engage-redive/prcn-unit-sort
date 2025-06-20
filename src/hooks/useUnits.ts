// hooks/useUnits.ts
import { useState, useEffect } from 'react';
import { Unit, UnitIconEntry, UnitElement, UnitPosition, SkillSourceInfo } from '../types/Unit';
import { SkillCategory, SkillCategoriesList } from '../types/SkillCategories';
import unitIconDataSource from '../data/unitIconID';
import { sampleUnits as rawUnitDataFromTsFile } from '../data/unitdata';

const unitIconData: UnitIconEntry[] = unitIconDataSource as UnitIconEntry[];

const parseRarity = (rarityStr: string | undefined): number => {
  if (!rarityStr) return 1;
  return rarityStr.match(/★/g)?.length || 0;
};

const parseAttackType = (attackTypeStr: string | undefined): number => {
  if (attackTypeStr === '物理') return 1;
  if (attackTypeStr === '魔法') return 2;
  return 0;
};

const parseElement = (elementStr: string | undefined): UnitElement => {
  switch (elementStr) {
    case "火": return "火";
    case "水": return "水";
    case "風": return "風";
    case "光": return "光";
    case "闇": return "闇";
    default: return "不明";
  }
};

const parsePosition = (positionStr: string | undefined): UnitPosition => {
  switch (positionStr) {
    case "前衛": return "前衛";
    case "中衛": return "中衛";
    case "後衛": return "後衛";
    default: return "不明";
  }
};

const parseIsLimited = (availabilityStr: string | undefined): number => {
  if (!availabilityStr) return 0;
  return availabilityStr.includes('期間限定') || availabilityStr.includes('フェス限定') ? 1 : 0;
};

const parseDateToISO = (dateStr: string | undefined): string => {
  if (!dateStr) return new Date(0).toISOString();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      try {
        const date = new Date(Date.UTC(year, month, day));
        if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
          return date.toISOString();
        }
      } catch (e) {
        console.warn(`Error parsing date string: ${dateStr}`, e);
      }
    }
  }
  console.warn(`Could not parse date string: ${dateStr}, using epoch time.`);
  return new Date(0).toISOString();
};

const parseSkillFlags = (
  ubDesc: string,
  s1Desc: string,
  s2Desc: string
): Partial<Record<SkillCategory, SkillSourceInfo>> => {
  const flags: Partial<Record<SkillCategory, SkillSourceInfo>> = {};
  const skillData = [
    { source: 'ub' as keyof SkillSourceInfo, desc: ubDesc ? ubDesc.toLowerCase() : "" },
    { source: 's1' as keyof SkillSourceInfo, desc: s1Desc ? s1Desc.toLowerCase() : "" },
    { source: 's2' as keyof SkillSourceInfo, desc: s2Desc ? s2Desc.toLowerCase() : "" }
  ];

  interface KeywordRule {
    category: SkillCategory;
    primaryKeywords: string[];
    secondaryKeywords?: string[];
    contextKeywords?: string[];
    negativeKeywords?: string[];
    exactContextKeywords?: boolean;
  }

  // このrules配列の充当が最も重要です。
  // 実際のスキル説明文の多様な表現に対応できるよう、網羅的かつ正確に定義する必要があります。
  const rules: KeywordRule[] = [
    // --- I. HP/TP関連 ---
    { category: "HP回復(自分)", primaryKeywords: ["自分のhpを回復", "自身のhpを回復", "自分のhpを小回復", "自身のhpを小回復", "自分のhpを中回復", "自身のhpを中回復", "自分のhpを大回復", "自身のhpを大回復", "自分のhpを特大回復", "自身のhpを特大回復", "hpを自分に回復", "hpを自身に回復", "hp回復する"], negativeKeywords: ["味方全体のhpを回復", "範囲内の味方すべてのhpを回復", "味方1キャラのhpを回復", "敵のhpを回復", "継続hp回復"] },
    { category: "HP回復(範囲)", primaryKeywords: ["hpを回復", "hpを小回復", "hpを中回復", "hpを大回復"], contextKeywords: ["自分の周囲の味方すべて", "自分の周りの味方", "範囲内の味方すべて", "自分を中心とした範囲内の味方すべて", "最もhpが低い味方1キャラを中心とした範囲内の味方すべて", "一番前の味方を中心として、範囲内の味方すべて"], negativeKeywords: ["味方全体", "自分自身", "自分のhpを", "継続hp"] },
    { category: "HP回復(全体)", primaryKeywords: ["hpを回復", "hpを小回復", "hpを中回復", "hpを大回復", "hpを特大回復"], contextKeywords: ["味方全体"], exactContextKeywords: true, negativeKeywords: ["自分自身", "自分のhpを", "継続hp"] },
    { category: "HP回復(単体)", primaryKeywords: ["hpを回復", "hpを小回復", "hpを中回復", "hpを大回復"], contextKeywords: ["味方1キャラのhpを", "最もhpが低い味方1キャラのhpを", "そのキャラのhpを", "hpが最も低い味方1人のhpを"], negativeKeywords: ["全体", "範囲", "自分自身", "自分のhpを", "継続hp"] },
    { category: "HP継続回復", primaryKeywords: ["継続hp回復状態を付与", "継続hp回復"] },
    { category: "TP回復(自分)", primaryKeywords: ["自分のtpを回復", "自身のtpを回復", "tpを自身に回復"], negativeKeywords: ["味方", "敵"] },
    { category: "TP回復(単体)", primaryKeywords: ["tpを回復", "tpを小回復", "tpを中回復", "tpを大回復"], contextKeywords: ["味方1キャラのtpを", "最もtpが低い味方1キャラのtpを", "そのキャラのtpを"], negativeKeywords: ["全体", "範囲", "自分自身", "自分のtpを", "継続tp"] },
    { category: "TP回復(範囲)", primaryKeywords: ["tpを回復", "tpを小回復", "tpを中回復", "tpを大回復"], contextKeywords: ["自分の周囲の味方すべて", "範囲内の味方すべて", "自分を中心とした範囲内の味方すべて", "最も魔法攻撃力が高い味方1キャラを中心とした範囲内の味方すべて"], negativeKeywords: ["味方全体", "自分自身", "自分のtpを", "継続tp"] },
    { category: "TP回復(全体)", primaryKeywords: ["tpを回復", "tpを小回復", "tpを中回復", "tpを大回復", "tpを特大回復"], contextKeywords: ["味方全体"], exactContextKeywords: true, negativeKeywords: ["自分自身", "自分のtpを"] },
    { category: "TP継続回復", primaryKeywords: ["継続tp回復状態を付与", "継続tp回復"] },
    { category: "敵TP減少", primaryKeywords: ["tpをダウン", "tpを減少"], contextKeywords: ["敵全体", "敵すべて", "範囲内の敵", "目の前の敵", "敵1キャラ"], negativeKeywords: ["味方", "自分", "アップ", "上昇", "回復"] },
    { category: "味方TP上昇アップ", primaryKeywords: ["tp上昇をアップ", "tp上昇を小アップ", "tp上昇を中アップ"], contextKeywords: ["味方全体", "味方すべて", "範囲内の味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "敵TP上昇ダウン", primaryKeywords: ["tp上昇をダウン", "tp上昇を小ダウン"], contextKeywords: ["敵全体", "敵すべて", "範囲内の敵", "目の前の敵", "敵1キャラ"], negativeKeywords: ["味方", "自分", "アップ"] },
    { category: "HP吸収アップ/効果", primaryKeywords: ["hp吸収をアップ", "hp吸収状態", "物理吸収バリア", "魔法吸収バリア", "物理/魔法吸収バリア"] },
    { category: "自己HP消費", primaryKeywords: ["自分のhpを消費", "自身のhpを消費", "残りhpの%を消費"], negativeKeywords: ["味方", "敵"] },
    { category: "敵HP回復量ダウン", primaryKeywords: ["hp回復量をダウン"], contextKeywords: ["敵全体", "敵すべて", "範囲内の敵", "目の前の敵", "敵1キャラ"], negativeKeywords: ["味方", "自分", "アップ"] },

    // --- II. バフ（味方強化） - 攻撃系バフ ---
    { category: "味方物理攻撃力アップ", primaryKeywords: ["物理攻撃力をアップ", "物理攻撃力を小アップ", "物理攻撃力を中アップ", "物理攻撃力を大アップ", "物理攻撃力を特大アップ", "物理攻撃力を極大アップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方魔法攻撃力アップ", primaryKeywords: ["魔法攻撃力をアップ", "魔法攻撃力を小アップ", "魔法攻撃力を中アップ", "魔法攻撃力を大アップ", "魔法攻撃力を特大アップ", "魔法攻撃力を極大アップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方物理クリティカル率アップ", primaryKeywords: ["物理クリティカルをアップ", "物理クリティカル率をアップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン", "ダメージ"] },
    { category: "味方魔法クリティカル率アップ", primaryKeywords: ["魔法クリティカルをアップ", "魔法クリティカル率をアップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン", "ダメージ"] },
    { category: "味方物理クリティカルダメージアップ", primaryKeywords: ["物理クリティカル時のダメージをアップ", "物理クリダメをアップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方魔法クリティカルダメージアップ", primaryKeywords: ["魔法クリティカル時のダメージをアップ", "魔法クリダメをアップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },

    // --- II. バフ（味方強化） - 防御系バフ ---
    { category: "味方物理防御力アップ", primaryKeywords: ["物理防御力をアップ", "物理防御力を小アップ", "物理防御力を中アップ", "物理防御力を大アップ", "物理防御力を特大アップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方魔法防御力アップ", primaryKeywords: ["魔法防御力をアップ", "魔法防御力を小アップ", "魔法防御力を中アップ", "魔法防御力を大アップ", "魔法防御力を特大アップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方物理ダメージカット", primaryKeywords: ["物理ダメージカット"], contextKeywords: ["味方", "自分"] },
    { category: "味方魔法ダメージカット", primaryKeywords: ["魔法ダメージカット"], contextKeywords: ["味方", "自分"] },

    // --- II. バフ（味方強化） - バリア系 ---
    { category: "物理無効バリア", primaryKeywords: ["物理無効バリア"] },
    { category: "魔法無効バリア", primaryKeywords: ["魔法無効バリア"] },
    { category: "物理魔法無効バリア", primaryKeywords: ["物理/魔法無効バリア", "物理・魔法無効バリア"] },
    { category: "物理吸収バリア", primaryKeywords: ["物理吸収バリア"] },
    { category: "魔法吸収バリア", primaryKeywords: ["魔法吸収バリア"] },
    { category: "物理魔法吸収バリア", primaryKeywords: ["物理/魔法吸収バリア", "物理・魔法吸収バリア"] },

    // --- II. バフ（味方強化） - その他バフ ---
    { category: "味方行動速度アップ", primaryKeywords: ["行動速度をアップ", "行動速度を小アップ", "行動速度を中アップ", "行動速度を大アップ", "行動速度を特大アップ"], contextKeywords: ["味方", "自分"], negativeKeywords: ["敵", "ダウン"] },
    { category: "味方回避アップ", primaryKeywords: ["回避をアップ"], contextKeywords: ["味方", "自分"] },
    { category: "味方無敵状態付与", primaryKeywords: ["無敵状態に"], contextKeywords: ["味方", "自分"] },
    { category: "味方状態異常無効/解除", primaryKeywords: ["状態異常を無効", "状態異常を解除"], contextKeywords: ["味方", "自分"] },
    { category: "攻撃対象にならない状態付与", primaryKeywords: ["攻撃の対象にならない状態"], contextKeywords: ["自分"] },
    { category: "復活/致死ダメージ時HP回復", primaryKeywords: ["倒れずにhpを回復", "hpが0になると", "致死ダメージ"] },
    { category: "飛行状態付与", primaryKeywords: ["飛行状態に"] },
    { category: "隠密状態付与", primaryKeywords: ["隠密状態に"] },
    { category: "調和状態付与", primaryKeywords: ["調和状態を付与"] },

    // --- III. デバフ（敵弱体化） - 攻撃系デバフ ---
    { category: "敵物理攻撃力ダウン", primaryKeywords: ["物理攻撃力をダウン", "物理攻撃力を小ダウン", "物理攻撃力を中ダウン", "物理攻撃力を大ダウン", "物理攻撃力を特大ダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "アップ"] },
    { category: "敵魔法攻撃力ダウン", primaryKeywords: ["魔法攻撃力をダウン", "魔法攻撃力を小ダウン", "魔法攻撃力を中ダウン", "魔法攻撃力を大ダウン", "魔法攻撃力を特大ダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "アップ"] },
    { category: "敵物理クリティカル率ダウン", primaryKeywords: ["物理クリティカルをダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "ダメージ", "アップ"] },
    { category: "敵魔法クリティカル率ダウン", primaryKeywords: ["魔法クリティカルをダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "ダメージ", "アップ"] },

    // --- III. デバフ（敵弱体化） - 防御系デバフ ---
    { category: "敵物理防御力ダウン", primaryKeywords: ["物理防御力をダウン", "物理防御力を小ダウン", "物理防御力を中ダウン", "物理防御力を大ダウン", "物理防御力を特大ダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "アップ"] },
    { category: "敵魔法防御力ダウン", primaryKeywords: ["魔法防御力をダウン", "魔法防御力を小ダウン", "魔法防御力を中ダウン", "魔法防御力を大ダウン", "魔法防御力を特大ダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "アップ"] },

    // --- III. デバフ（敵弱体化） - その他デバフ ---
    { category: "敵行動速度ダウン", primaryKeywords: ["行動速度をダウン", "行動速度を小ダウン", "行動速度を中ダウン", "行動速度を大ダウン"], contextKeywords: ["敵"], negativeKeywords: ["味方", "自分", "アップ"] },
    { category: "敵クリティカル時被ダメージアップ", primaryKeywords: ["クリティカルを受けた際のダメージをアップ", "クリティカル被ダメージをアップ"], contextKeywords: ["敵"] },
    { category: "敵被ダメージアップ(汎用)", primaryKeywords: ["被ダメージをアップ", "受けるダメージをアップ"], contextKeywords: ["敵"] },
    { category: "敵バリア解除", primaryKeywords: ["バリアを解除", "バリアを全て解除"], contextKeywords: ["敵"] },
    { category: "敵ステータスアップ効果解除", primaryKeywords: ["ステータスアップ効果を解除"], contextKeywords: ["敵"] },
    { category: "敵命中率ダウン", primaryKeywords: ["命中をダウン", "命中率をダウン"], contextKeywords: ["敵"] },

    // --- IV. 状態異常（敵対象） ---
    { category: "スタン", primaryKeywords: ["スタンさせ", "スタン状態にする", "スタンする"] },
    { category: "麻痺", primaryKeywords: ["麻痺させ", "麻痺状態にする"] },
    { category: "束縛", primaryKeywords: ["束縛し", "束縛状態にする"] },
    { category: "凍結", primaryKeywords: ["凍結させ", "凍結状態にする"] },
    { category: "石化", primaryKeywords: ["石化させ", "石化状態にする"] },
    { category: "睡眠", primaryKeywords: ["睡眠状態にする"] },
    { category: "混乱", primaryKeywords: ["混乱状態に", "混乱させる"] },
    { category: "誘惑", primaryKeywords: ["誘惑状態に", "誘惑する"] },
    { category: "恐慌", primaryKeywords: ["恐慌状態に", "恐慌させる"] },
    { category: "暗闇", primaryKeywords: ["暗闇状態に", "暗闇にする"] },
    { category: "毒/猛毒", primaryKeywords: ["毒状態に", "猛毒状態に", "毒を付与", "猛毒を付与"] },
    { category: "火傷", primaryKeywords: ["火傷状態に", "火傷を付与"] },
    { category: "呪い/呪詛", primaryKeywords: ["呪い状態に", "呪詛状態に", "呪いを付与", "呪詛を付与"] },
    { category: "割合ダメージ状態(敵)", primaryKeywords: ["割合ダメージを発生", "割合ダメージを与える状態に"] },

    // --- V. コントロール（敵対象） ---
    { category: "吹き飛ばし/ノックバック", primaryKeywords: ["吹き飛ばす", "ノックバック"] },
    { category: "引き寄せ", primaryKeywords: ["引き寄せる"] },
    { category: "挑発", primaryKeywords: ["挑発する", "挑発し"] },
    { category: "行動時間停止", primaryKeywords: ["行動時間を停止"] },
    { category: "執着", primaryKeywords: ["執着状態に"] },

    // --- VI. ダメージ特性 ---
    { category: "防御参照型ダメージ", primaryKeywords: ["物理防御力が魔法防御力より低い場合、物理ダメージ扱いになる魔法", "物理と魔法攻撃力を合わせた"] },
    { category: "防御力一定値無視ダメージ", primaryKeywords: ["物理防御力を一定値無視", "魔法防御力を一定値無視"] },
    { category: "クリティカル確定攻撃", primaryKeywords: ["必ずクリティカル", "確定クリティカル"] },
    { category: "クリティカル時ダメージ倍率変化", primaryKeywords: ["クリティカルした場合のダメージは、2倍ではなく3倍", "クリティカルした場合のダメージは、2倍ではなく4倍", "クリティカルした場合のダメージは、2倍ではなく5倍"] },
    { category: "必中攻撃", primaryKeywords: ["必ず命中"] },
    { category: "追加ダメージ", primaryKeywords: ["追加のダメージ", "追加でダメージ"] },
    { category: "割合ダメージ(スキル直撃)", primaryKeywords: ["最大hpに応じて割合ダメージ"] , contextKeywords: ["継続して発生", "その敵の最大hpに応じて"], negativeKeywords:["状態にする"]},

    // --- VII. スキル特殊効果 ---
    { category: "召喚", primaryKeywords: ["召喚する", "を召喚"] },
    { category: "フィールド展開", primaryKeywords: ["フィールドを展開"] },
    { category: "行動パターン変化", primaryKeywords: ["行動パターンが変化"] },
    { category: "スキル効果量変化(条件付き)", primaryKeywords: ["数に応じて増加", "数に応じて上昇", "多いほどアップ", "低いほどアップ", "hpに応じて最大", "攻撃力に応じて最大", "使用するたび"] },
    { category: "複数回ヒット攻撃", primaryKeywords: ["ダメージを2回", "ダメージを3回", "ダメージを計3回", "ダメージを計4回"] },
    { category: "特定属性味方への追加効果", primaryKeywords: ["属性の味方すべてに", "属性のキャラに対しては"] },
    { category: "特定タイプ敵への追加効果", primaryKeywords: ["物理攻撃をする敵だった場合", "魔法攻撃をする敵だった場合"] },
    { category: "敵討伐時追加効果", primaryKeywords: ["敵を倒した場合", "とどめを刺した"] },
    { category: "ダメージでTP回復しない効果", primaryKeywords: ["ダメージでは自分のtpは回復しない", "ダメージでは敵のtpは回復しない"] },
  ];

  for (const rule of rules) {
    for (const data of skillData) {
      if (!data.desc) continue;

      let primaryMatch = false;
      for (const pKeyword of rule.primaryKeywords) {
        if (data.desc.includes(pKeyword)) {
          primaryMatch = true;
          break;
        }
      }
      if (!primaryMatch) continue;

      let secondaryMatch = true;
      if (rule.secondaryKeywords && rule.secondaryKeywords.length > 0) {
        secondaryMatch = false;
        for (const sKeyword of rule.secondaryKeywords) {
          if (data.desc.includes(sKeyword)) {
            secondaryMatch = true;
            break;
          }
        }
      }
      if (!secondaryMatch) continue;

      let contextSatisfied = false;
      if (rule.contextKeywords && rule.contextKeywords.length > 0) {
        for (const cKeyword of rule.contextKeywords) {
          if (rule.exactContextKeywords) {
            const regex = new RegExp(`(^|\\W)${cKeyword}(\\W|$)`, 'iu');
            if (regex.test(data.desc)) {
              contextSatisfied = true;
              break;
            }
          } else {
            if (data.desc.includes(cKeyword)) {
              contextSatisfied = true;
              break;
            }
          }
        }
      } else {
        contextSatisfied = true;
      }

      // HP回復(自分) の特殊なコンテキストチェック
      if (!contextSatisfied && rule.category === "HP回復(自分)") {
          if ( (data.desc.includes("自分のhpを") || data.desc.includes("自身のhpを")) ) {
              contextSatisfied = true;
          } else {
              continue; // primaryだけでは曖昧な "hp回復する" などの場合、自分への言及がなければスキップ
          }
      } else if (!contextSatisfied) {
          continue;
      }


      let negativeMatch = false;
      if (rule.negativeKeywords) {
        for (const nKeyword of rule.negativeKeywords) {
          if (rule.category === "HP回復(自分)" && (nKeyword === "味方全体のhpを回復" || nKeyword === "範囲内の味方すべてのhpを回復" || nKeyword === "味方1キャラのhpを回復")) {
            if(data.desc.includes(nKeyword) && !(data.desc.includes("自分のhpを") || data.desc.includes("自身のhpを"))){
                negativeMatch = true;
                break;
            }
          } else if (rule.category !== "HP回復(自分)" && data.desc.includes(nKeyword)) {
             negativeMatch = true;
             break;
          }
        }
      }
      if (negativeMatch) continue;

      if (!flags[rule.category]) {
        flags[rule.category] = {};
      }
      flags[rule.category]![data.source] = true;
    }
  }
  return flags;
};

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processUnitData = () => {
      try {
        setLoading(true);
        const rawData: any[] = rawUnitDataFromTsFile as any[];

        const transformedUnits: Unit[] = rawData
          .map((rawUnit: any, index: number) => {
            if (!rawUnit || typeof rawUnit !== 'object') {
              console.warn(`Skipping invalid raw unit data at index ${index}:`, rawUnit);
              return null;
            }

            const charaName = rawUnit["キャラ名"] || `名称不明(${index})`;
            const version = rawUnit["バージョン"] || '';
            const unitName = `${charaName}${version ? `（${version}）` : ''}`;

            let actualName = charaName;
            if (unitName.includes('（')) {
                const parts = unitName.split('（');
                if (parts.length > 0) {
                    actualName = parts[0].trim();
                }
            }

            const ubDescription = rawUnit["ユニオンバースト説明"] || '';
            const skill1Description = rawUnit["スキル1説明"] || '';
            const skill2Description = rawUnit["スキル2説明"] || '';

            const ubName = rawUnit["ユニオンバースト"] || 'ユニオンバースト';
            const skill1Name = rawUnit["スキル1"] || 'スキル1';
            const skill2Name = rawUnit["スキル2"] || 'スキル2';

            const skillFlags = parseSkillFlags(ubDescription, skill1Description, skill2Description);

            return {
              unit_id: rawUnit.unit_id || (100000 + index + 1),
              unit_name: unitName,
              comment: ubDescription || skill1Description || skill2Description || 'キャラクター説明がありません。',
              is_limited: parseIsLimited(rawUnit["入手手段"]),
              rarity: parseRarity(rawUnit["初期★"]),
              atk_type: parseAttackType(rawUnit["タイプ"]),
              actual_name: actualName,
              element: parseElement(rawUnit["属性"]),
              position: parsePosition(rawUnit["配置"]),

              ub_description: ubDescription,
              skill1_description: skill1Description,
              skill2_description: skill2Description,

              ub_name: ubName,
              skill1_name: skill1Name,
              skill2_name: skill2Name,

              skill_flags: skillFlags,

              only_disp_owned: rawUnit.only_disp_owned || 0,
              start_time: parseDateToISO(rawUnit["キャラ実装日"]),
              end_time: rawUnit.end_time || "2099-12-31T23:59:59.999Z",
              motion_type: rawUnit.motion_type || 1,
              se_type: rawUnit.se_type || 1,
              move_speed: rawUnit.move_speed || 100,
              search_area_width: rawUnit.search_area_width || 300,
              normal_atk_cast_time: rawUnit.normal_atk_cast_time || 1.0,
              cutin: rawUnit.cutin || 0,
              cutin_star6: rawUnit.cutin_star6 || 0,
              visual_change_flag: rawUnit.visual_change_flag || 0,
              prefab_id: rawUnit.prefab_id || (100000 + index + 1) * 10,
              prefab_id_battle: rawUnit.prefab_id_battle || ((100000 + index + 1) * 10 + 1),
              multiple_unit_id: rawUnit.multiple_unit_id || 0,
              exchange_id: rawUnit.exchange_id || 0,
              kana: rawUnit.kana || '',
              guild_id: rawUnit.guild_id || 0,
              exskill_display: rawUnit.exskill_display || 0,
              comment_2: skill1Description || skill2Description || '',
              only_disp_owned_2: rawUnit.only_disp_owned_2 || 0,
              start_time_2: parseDateToISO(rawUnit["キャラ実装日"]),
              end_time_2: rawUnit.end_time_2 || "2099-12-31T23:59:59.999Z",
              original_unit_id: rawUnit.original_unit_id || 0,
            };
          })
          .filter(Boolean) as Unit[];

        setUnits(transformedUnits);
      } catch (err) {
        console.error('Error processing unit data:', err);
        setError(err instanceof Error ? err.message : 'キャラクターデータの処理中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    processUnitData();
  }, []);

  const getUnitIcon = (unitNameFromApp: string | undefined | null): string | null => {
    if (typeof unitNameFromApp !== 'string' || !unitNameFromApp) {
      return null;
    }
    let baseName = unitNameFromApp;
    if (unitNameFromApp.includes('（')) {
        const parts = unitNameFromApp.split('（');
        if (parts.length > 0) {
            baseName = parts[0].trim();
        }
    }
    let iconEntry = unitIconData.find(entry => entry.name === unitNameFromApp);
    if (!iconEntry) {
      iconEntry = unitIconData.find(entry => entry.name === baseName);
    }
    if (!iconEntry) {
      return null;
    }
    const iconId = iconEntry.idStar3 || iconEntry.idStar6 || iconEntry.idStar1;
    if (!iconId) {
      return null;
    }
    return `/icon/${iconId}.webp`;
  };

  return { units, loading, error, getUnitIcon };
};