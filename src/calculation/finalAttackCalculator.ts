// calculation/finalAttackCalculator.ts
import { Ability, Item, DisasterState, MoveCategory, PokemonType, ProtosynthesisBoostTarget, QuarkDriveBoostTarget, Weather, Field } from '../types';

// multiplyByQ12AndRound は Q12 形式の乗数を適用し、結果を丸める関数
function multiplyByQ12AndRound(baseValue: number, q12Multiplier: number): number {
    if (q12Multiplier === 4096) { // 1倍なら何もしない
        return baseValue;
    }
    const intermediateA = baseValue * q12Multiplier;
    let resultB = Math.floor(intermediateA / 4096);
    if ((intermediateA % 4096) > 2048) { // 五捨五超入 (0.5より大きい場合切り上げ)
        resultB += 1;
    }
    return resultB;
}


export const calculateFinalAttack = (
    baseAttack: number, // ランク補正済み実数値
    attackerAbility: Ability | null,
    attackerItem: Item | null,
    defenderAbility: Ability | null,
    moveCategory: MoveCategory,
    moveType: PokemonType,
    disasters: DisasterState,
    isAttackerProtosynthesisActive: boolean,
    attackerProtosynthesisBoostedStat: ProtosynthesisBoostTarget | null,
    isAttackerQuarkDriveActive: boolean,
    attackerQuarkDriveBoostedStat: QuarkDriveBoostTarget | null,
    weather: Weather,
    field: Field,
    abilityUiFlags?: { [key: string]: boolean }
): number => {
    let attackMultiplier = 4096; // 初期値は4096 (1倍)

    // 1. わざわいの影響 (場の効果で、攻撃側のステータスが下がるもの)
    // これらの補正は攻撃ステータスにかかるため、ここで処理
    if (disasters.vessel && moveCategory === 'special' && attackerAbility?.id !== 'vessel_of_ruin') {
        attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 3072); // 0.75倍
    }
    if (disasters.talisman && moveCategory === 'physical' && attackerAbility?.id !== 'tablet_of_ruin') {
        attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 3072); // 0.75倍
    }

    // 2. 攻撃側の特性による補正
    if (attackerAbility) {
        // こだいかっせい
        if (isAttackerProtosynthesisActive && attackerAbility.id === 'protosynthesis') {
            if ((attackerProtosynthesisBoostedStat === 'attack' && moveCategory === 'physical') ||
                (attackerProtosynthesisBoostedStat === 'specialAttack' && moveCategory === 'special')) {
                attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 5325); // 1.3倍
            }
        }

        // クォークチャージ
        if (isAttackerQuarkDriveActive && attackerAbility.id === 'quark_drive') {
            if ((attackerQuarkDriveBoostedStat === 'attack' && moveCategory === 'physical') ||
                (attackerQuarkDriveBoostedStat === 'specialAttack' && moveCategory === 'special')) {
                attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 5325); // 1.3倍
            }
        }

        switch (attackerAbility.id) {
            case 'guts':
                if (abilityUiFlags?.['guts_active'] && moveCategory === 'physical') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'torrent':
                if (abilityUiFlags?.['hp_condition_active'] && moveType === 'water') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'overgrow':
                if (abilityUiFlags?.['hp_condition_active'] && moveType === 'grass') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'blaze':
                if (abilityUiFlags?.['hp_condition_active'] && moveType === 'fire') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'swarm':
                if (abilityUiFlags?.['hp_condition_active'] && moveType === 'bug') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'flashfire':
                if (abilityUiFlags?.['flash_fire_boost'] && moveType === 'fire') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'solarpower':
                if ((weather === 'sun' || weather === 'harsh_sunlight') && moveCategory === 'special') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'rockypayload':
                if (moveType === 'rock') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'steelworker':
                if (moveType === 'steel') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'gorillatactics':
                if (moveCategory === 'physical') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'dragonsmaw':
                if (moveType === 'dragon') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
                }
                break;
            case 'transistor':
                if (moveType === 'electric') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 5325); // 1.3倍
                }
                break;
            case 'hadronengine':
                if (moveCategory === 'special' && field === 'electric') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 5461); // 4/3倍
                }
                break;
            case 'orichalcumpulse':
                if (moveCategory === 'physical' && (weather === 'sun' || weather === 'harsh_sunlight')) {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 5461); // 4/3倍
                }
                break;
            case 'hugepower':
                if (moveCategory === 'physical') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 8192); 
                }
                break;
            case 'purepower':
                if (moveCategory === 'physical') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 8192); 
                }
                break;
            case 'water bubble':
                if (moveType === 'water') {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 8192); 
                }
                break;
            case 'slowstart':
                {
                    attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 2048);  
                }
                break;
        }
    }

    // 3. 防御側の特性による補正 (攻撃側の攻撃ステータスに影響を与えるもの)
    //    例: フラワーギフト (味方にかかる効果で、攻撃側のステータスを上げるもの)
    //    今回は攻撃側の攻撃力を直接下げる防御側特性はリストにないため、このセクションは空。
    //    厚い脂肪などはM値や技威力補正で処理されることが多い。
    if (defenderAbility) {
        // switch (defenderAbility.id) {
        //   // 例: ふしぎなうろこ (防御側が状態異常のとき防御1.5倍 -> finalDefenseCalculatorで処理)
        // }
    }


    // 4. 攻撃側のアイテムによる補正
    if (attackerItem) {
        // アイテムIDで比較するのがより堅牢
        if (attackerItem.id === 'choiceband' && moveCategory === 'physical') {
            attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
        } else if (attackerItem.id === 'choicespecs' && moveCategory === 'special') {
            attackMultiplier = multiplyByQ12AndRound(attackMultiplier, 6144); // 1.5倍
        }
        // ちからのハチマキ、ものしりメガネなどもここに (威力補正ではなくステータス補正の場合)
        // いのちのたまの攻撃1.3倍は、ダメージ計算の最終補正(M値)で処理されることが多い
    }

    // 最後に、元の攻撃力に全ての倍率を適用
    const finalAttack = multiplyByQ12AndRound(baseAttack, attackMultiplier);

    return Math.max(1, finalAttack); // 攻撃力は最低1
};