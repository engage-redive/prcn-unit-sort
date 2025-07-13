import { Character, UnitSkills, Effect, RankItem, RankingCalculator } from '../types/character';

// --- 計算ヘルパー関数 (変更なし) ---
const calculateValue = (formula: string | null, level: number, phyAtk: number, magAtk: number): number | null => {
  if (!formula) return null;

  if (formula.endsWith('%')) {
    const numericPart = formula.slice(0, -1);
    if (!isNaN(Number(numericPart))) {
      return Number(numericPart);
    }
  }

  if (!isNaN(Number(formula))) {
    return Number(formula);
  }

  const uncalculableKeywords = ['HP減少量', '与ダメージ', '残りHP', '消費した【レイスボディ】', 'おともだち数', '【剣圧】', '【お堪忍袋】', '【ネバネバ】', '【氷竜の印】', '【ちぇる】', '【味方と敵の数】', '【範囲内の敵の数】', '【範囲内の味方の人数】'];
  if (uncalculableKeywords.some(keyword => formula.includes(keyword))) {
    return null;
  }
  
  try {
    const expression = formula
      .replace(/スキルLv/g, String(level))
      .replace(/物理攻撃力/g, String(phyAtk))
      .replace(/魔法攻撃力/g, String(magAtk));
    
    if (/^[0-9+\-*/().\s%]+$/.test(expression)) {
      return Math.floor(new Function('return ' + expression)());
    }
  } catch (e) {
    console.error("Formula calculation error:", e, "Formula:", formula);
  }
  return null;
};

// --- ランキング計算機の実装 ---

const createRankingCalculator = (
    effectType: string,
    targetType: 'single' | 'area' | 'any',
    isDebuff: boolean = false,
    debuffType: string | null = null
): RankingCalculator => {
    return (characters, skills, level, phyAtk, magAtk) => {
        const rankItems: RankItem[] = [];

        characters.forEach(char => {
            const charSkills = skills[char.fullName];
            if (!charSkills) return;

            for (const skillKey in charSkills) {
                const skillDetail = charSkills[skillKey];
                if (!skillDetail) continue;
                
                let skillIconType = 'skill';
                if (skillKey.includes('union_burst')) skillIconType = 'ub';
                else if (skillKey.includes('special')) skillIconType = 'special';
                
                skillDetail.versions.forEach(version => {
                    // ★★★★★ 修正されたレベル条件フィルター ★★★★★
                    const descriptionAndNote = (version.description || '') + (version.note || '');
                    const levelRequirementMatch = descriptionAndNote.match(/【?スキルLv(\d+)以上】?/);

                    // レベル条件が存在する場合のみ、フィルタリングを実行
                    if (levelRequirementMatch) {
                        const requiredLevel = parseInt(levelRequirementMatch[1], 10);
                        // 条件レベルが260を超える場合は、このスキルバージョンをスキップ
                        if (requiredLevel > 260) {
                            return;
                        }
                    }

                    let totalValue = 0;
                    let details = '';

                    const allEffects: Effect[] = version.effects.flatMap(e => {
                        if (e.type === 'フィールド' && e.field_effects) {
                            return e.field_effects.map(fe => ({ ...fe, target: e.target, condition: e.condition }));
                        }
                        return e;
                    });

                    if (debuffType === '物理防御力DOWN' && allEffects.some(e => e.type === '物理攻撃力DOWN')) {
                        return;
                    }
                    if (debuffType === '魔法防御力DOWN' && allEffects.some(e => e.type === '魔法攻撃力DOWN')) {
                        return;
                    }

                    let matchingEffects = allEffects.filter(effect => {
                        let isTargetMatch = false;
                        if (targetType === 'single') {
                            isTargetMatch = effect.target?.includes('1キャラ') || effect.target?.includes('自分');
                        } else if (targetType === 'area') {
                            isTargetMatch = effect.target?.includes('範囲') || effect.target?.includes('全体');
                        } else if (targetType === 'any') {
                            isTargetMatch = true;
                        }

                        if (isDebuff && !effect.target?.includes('敵')) {
                            return false;
                        }
                        
                        const typeToCheck = isDebuff ? debuffType : effectType;
                        return typeof effect.type === 'string' && effect.type === typeToCheck && isTargetMatch;
                    });

                    // Handle conditional effects: if multiple effects of the same type have conditions,
                    // pick the one with the highest potential value.
                    if (matchingEffects.length > 1 && matchingEffects.every(e => e.condition)) {
                        const maxEffect = matchingEffects.reduce((max, current) => {
                            const maxValue = calculateValue(max.formula, level, phyAtk, magAtk) || 0;
                            const currentValue = calculateValue(current.formula, level, phyAtk, magAtk) || 0;
                            return currentValue > maxValue ? current : max;
                        });
                        matchingEffects = [maxEffect];
                    }
                    
                    if (matchingEffects.length > 0) {
                        matchingEffects.forEach(effect => {
                            if (effect.formula) {
                                const hitCountMatch = effect.note?.match(/(\d+)回/);
                                const hitCount = hitCountMatch ? parseInt(hitCountMatch[1], 10) : 1;
                                
                                const value = calculateValue(effect.formula, level, phyAtk, magAtk);
                                if (value !== null) {
                                    totalValue += value * hitCount;
                                }
                            }
                            if (effect.duration) details += `持続:${effect.duration}秒 `;
                            if (effect.condition) details += `条件:${effect.condition} `;
                        });

                        if (totalValue > 0) {
                            rankItems.push({
                                characterId: char.id,
                                characterName: char.name,
                                characterFullName: char.fullName,
                                skillName: version.name,
                                skillIcon: skillIconType,
                                value: totalValue,
                                details: details.trim(),
                                skillType: skillKey, // ★ skillKeyを渡す
                            });
                        }
                    }
                });
            }
        });
        return rankItems.sort((a, b) => b.value - a.value);
    };
};

const createSpeedCalculator = (): RankingCalculator => {
     return (characters, skills, level, phyAtk, magAtk) => {
        const rankItems: RankItem[] = [];
        characters.forEach(char => {
            const charSkills = skills[char.fullName];
            if (!charSkills) return;
            
            for (const skillKey in charSkills) {
                const skillDetail = charSkills[skillKey];
                if (!skillDetail) continue;

                let skillIconType = 'skill';
                if (skillKey.includes('union_burst')) skillIconType = 'ub';
                else if (skillKey.includes('special')) skillIconType = 'special';

                skillDetail.versions.forEach(version => {
                    version.effects.forEach(effect => {
                        // ★ ここも完全一致に修正
                        if (effect.type === '行動速度UP' && effect.formula) {
                            const value = parseInt(effect.formula, 10);
                             if (value > 0) {
                                let details = `持続:${effect.duration || '永続'}秒`;
                                rankItems.push({
                                    characterId: char.id,
                                    characterName: char.name,
                                    characterFullName: char.fullName,
                                    skillName: version.name,
                                    skillIcon: skillIconType,
                                    value: value,
                                    details: details,
                                });
                            }
                        }
                    });
                });
            }
        });
        return rankItems.sort((a, b) => b.value - a.value);
    };
}

// ★ デバフ系ランキングを追加
const createDebuffCalculator = (
    debuffType: string
): RankingCalculator => {
    return createRankingCalculator(debuffType, 'any', true, debuffType);
}

export const rankingCalculators = {
    single_phys_damage: createRankingCalculator('物理ダメージ', 'single'),
    single_magic_damage: createRankingCalculator('魔法ダメージ', 'single'),
    area_phys_damage: createRankingCalculator('物理ダメージ', 'area'),
    area_magic_damage: createRankingCalculator('魔法ダメージ', 'area'),
    single_heal: createRankingCalculator('HP回復', 'single'),
    area_heal: createRankingCalculator('HP回復', 'area'),
    single_phys_atk_buff: createRankingCalculator('物理攻撃力UP', 'single'),
    area_phys_atk_buff: createRankingCalculator('物理攻撃力UP', 'area'),
    single_magic_atk_buff: createRankingCalculator('魔法攻撃力UP', 'single'),
    area_magic_atk_buff: createRankingCalculator('魔法攻撃力UP', 'area'),
    // ★ 攻撃デバフも追加
    phys_atk_debuff: createDebuffCalculator('物理攻撃力DOWN'),
    magic_atk_debuff: createDebuffCalculator('魔法攻撃力DOWN'),
    phys_def_debuff: createDebuffCalculator('物理防御力DOWN'),
    magic_def_debuff: createDebuffCalculator('魔法防御力DOWN'),
    single_tp_charge: createRankingCalculator('TP回復', 'single'),
    area_tp_charge: createRankingCalculator('TP回復', 'area'),
    tp_boost: createRankingCalculator('TP上昇UP', 'area'),
    speed_buff: createSpeedCalculator(),
};