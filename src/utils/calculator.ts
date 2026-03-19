// src/utils/calculator.ts
import {
    Pokemon, Move, DamageCalculation, StatCalculation, PokemonType, Item, Ability, StatType,
    Field, DisasterState, MoveCategory, Weather, TeraBurstEffectiveType,
    ProtosynthesisBoostTarget, QuarkDriveBoostTarget
} from '../types';
import { typeEffectiveness } from '../data/typeEffectiveness'; // パスを確認
import { calculateFinalMovePower } from '../calculation/finalPowerCalculator'; // パスを確認
import { calculateFinalAttack } from '../calculation/finalAttackCalculator'; // パスを確認
import { calculateFinalDefense } from '../calculation/finalDefenseCalculator'; // パスを確認
import { calculateMValueQ12, multiplyByQ12AndRound } from '../calculation/mValueCalculator'; // パスを確認

export const calculateStat = (
    baseStat: number,
    statPoints: number,
    _level: number = 50,
    natureModifier: number = 1.0,
    isHp: boolean = false,
    rank: number = 0,
    _item: Item | null = null,
    isCriticalHit: boolean = false, // クリティカルヒット時にtrue
    isAttackStatForCritRank: boolean = false, // クリティカル時に攻撃ランクのマイナスを無視する場合true
    isDefenseStatForCritRank: boolean = false // クリティカル時に防御ランクのプラスを無視する場合true
): number => {
    let stat: number;
    if (isHp) {
        if (baseStat === 1) return 1; // ヌケニン用
        stat = Math.floor(baseStat + 75 + statPoints);
    } else {
        stat = Math.floor(baseStat + 20 + statPoints);
        stat = Math.floor(stat * natureModifier);

        let effectiveRank = rank;

        if (isCriticalHit) {
            if (isAttackStatForCritRank && effectiveRank < 0) { // 攻撃側ランクがマイナスなら0にする
                effectiveRank = 0;
            }
            if (isDefenseStatForCritRank && effectiveRank > 0) { // 防御側ランクがプラスなら0にする
                effectiveRank = 0;
            }
        }

        if (effectiveRank !== 0) {
            const rankMultiplier = effectiveRank > 0
                ? (2 + effectiveRank) / 2
                : 2 / (2 - effectiveRank);
            stat = Math.floor(stat * rankMultiplier);
        }
    }
    return Math.max(1, stat);
};

export const calculateEffectiveness = (moveType: PokemonType, moveId: string, defenderTypes: PokemonType[], isInverseBattle: boolean = false): number => {
    let effectiveness = 1;
    for (const defenderType of defenderTypes) {
        if (defenderType && typeEffectiveness[moveType] && typeEffectiveness[moveType].hasOwnProperty(defenderType)) {
            // ▼▼▼ ここから変更 ▼▼▼
            let currentEffectiveness: number;

            // フリーズドライが水タイプに当たる場合の特別処理
            if (moveId === 'freezedry' && defenderType === 'water') {
                currentEffectiveness = 2;
            } else {
                // 通常の相性計算
                currentEffectiveness = typeEffectiveness[moveType][defenderType];
            }
            // ▲▲▲ ここまで変更 ▲▲▲

            if (isInverseBattle) {
                if (currentEffectiveness === 0) currentEffectiveness = 2;
                else if (currentEffectiveness === 0.5) currentEffectiveness = 2;
                // ... (既存のさかさバトル処理はそのまま)
            }
            effectiveness *= currentEffectiveness;
        }
    }
    return effectiveness;
};

interface AttackerEffectiveStats {
    attack: StatCalculation;
    specialAttack: StatCalculation;
    defense: StatCalculation; // ボディプレス用
    speed: StatCalculation; // 将来的な拡張用
    abilityUiFlags?: { [key: string]: boolean };
}

interface DefenderEffectiveStats {
    hp: StatCalculation;
    attack: StatCalculation; // イカサマ用
    defense: StatCalculation;
    specialDefense: StatCalculation;
    speed: StatCalculation; // 将来的な拡張用
}


export const calculateDamage = (
    attacker: Pokemon,
    defender: Pokemon,
    move: Move, // この move は App.tsx で getEffectiveMoveProperties とカテゴリ更新を経た後の技情報
    attackerStats: AttackerEffectiveStats,
    defenderStats: DefenderEffectiveStats,
    field: Field,
    attackerItem: Item | null = null,
    defenderItem: Item | null = null,
    attackerTeraType: PokemonType | null = null,
    isStellarTeraAttacker: boolean = false,
    level: number = 50,
    isDoubleBattle: boolean = false,
    isBurned: boolean = false, // 攻撃側のやけど状態
    hasHelpingHand: boolean = false,
    hasReflect: boolean = false, // 防御側のリフレクター状態
    hasLightScreen: boolean = false, // 防御側のひかりのかべ状態
    attackerAbility: Ability | null = null,
    _attackerBoostedStat: StatType = null, // App.tsxから渡されるProtosynthesis/QuarkDriveのブースト対象(現状未使用)
    defenderAbility: Ability | null = null,
    _defenderBoostedStat: StatType = null, // App.tsxから渡されるProtosynthesis/QuarkDriveのブースト対象(現状未使用)
    weather: Weather = 'none',
    disasters: DisasterState = { sword: false, ball: false, vessel: false, talisman: false },
    hasFriendGuard: boolean = false,
    attackerTeraBlastConfig?: {
        actualType: TeraBurstEffectiveType | null;
        actualCategory: MoveCategory | null;
    },
    defenderIsTerastallized?: boolean,
    isAttackerProtosynthesisActive: boolean = false,
    attackerProtosynthesisBoostedStat: ProtosynthesisBoostTarget | null = null,
    isDefenderProtosynthesisActive: boolean = false,
    defenderProtosynthesisBoostedStat: ProtosynthesisBoostTarget | null = null,
    isAttackerQuarkDriveActive: boolean = false,
    attackerQuarkDriveBoostedStat: QuarkDriveBoostTarget | null = null,
    isDefenderQuarkDriveActive: boolean = false,
    defenderQuarkDriveBoostedStat: QuarkDriveBoostTarget | null = null,
    moveUiOptionStates?: { [key: string]: boolean },
    _attackerAbilityUiFlags?: { [key: string]: boolean },
    parentalBondMultiplier: number = 1.0,
    isFirstHit: boolean = true // 初回ヒットか？（2発目以降はマルチスケイル等発動不可）
): DamageCalculation => {
    const zeroDamages = Array(16).fill(0);
    const errorReturn = {
        minDamage: 0, maxDamage: 0, critMinDamage: 0, critMaxDamage: 0,
        minPercentage: 0, maxPercentage: 0, critMinPercentage: 0, critMaxPercentage: 0,
        effectiveness: 1, teraBoost: 1, normalDamages: zeroDamages, criticalDamages: zeroDamages,
    };

    if (!move || !attacker || !defender || !attackerStats || !defenderStats) {
        return errorReturn;
    }

    const isPsyshockLike = move.dynamicEffectId === "calcDefForSpecial"; // サイコショック/サイコブレイクなど
    const isPhotonGeyser = move.id === "photongeyser"; // フォトンゲイザー

    let moveCategoryForCalc = move.category as MoveCategory; // App.tsxでテラバースト/テラクラスター/フォトンゲイザー用に更新済み
    let moveTypeForCalc = move.type; // App.tsxでテラクラスター用に更新済み (getEffectiveMovePropertiesでも変動しうる)
    let movePowerForCalc = move.power; // getEffectiveMovePropertiesで変動しうる

    if (moveCategoryForCalc === 'status' || movePowerForCalc === 0 || movePowerForCalc === undefined) {
        return errorReturn;
    }

    const isTerapagosStellarFormUsingStarstorm = attacker.id === "1024-s" && move.id === "terastarstorm";
    const isBodyPress = move.id === 'bodypress';

    // ボディプレスは物理技として扱う (カテゴリは既に 'physical' になっているはずだが念のため)
    if (isBodyPress) {
        moveCategoryForCalc = 'physical';
    }

    // ダメージ計算の攻防ステータス参照に使われるカテゴリ
    // テラバーストの場合は attackerTeraBlastConfig.actualCategory が優先される
    let effectiveMoveCategoryForDamageCalc: MoveCategory = moveCategoryForCalc;

    const isTeraBlastActive = move.isTeraBlast && (attackerTeraType !== null || isStellarTeraAttacker);
    if (isTeraBlastActive && attackerTeraBlastConfig) {
        if (attackerTeraBlastConfig.actualType) {
            // ステラテラバーストの技タイプは特殊 ('normal' で計算し、相性は常に抜群)
            // ただし、calculator 内では moveTypeForCalc を 'normal' として扱う
            moveTypeForCalc = attackerTeraBlastConfig.actualType === 'stellar' ? 'normal' : attackerTeraBlastConfig.actualType;
        }
        if (attackerTeraBlastConfig.actualCategory) {
            effectiveMoveCategoryForDamageCalc = attackerTeraBlastConfig.actualCategory;
        } else if (!isBodyPress && !isPhotonGeyser) { // ボディプレスとフォトンゲイザーは自身のカテゴリ決定ロジックを持つ
            const determinedCategory = attackerStats.attack.final > attackerStats.specialAttack.final ? 'physical' : 'special';
            effectiveMoveCategoryForDamageCalc = determinedCategory;
        }
        if (isStellarTeraAttacker) movePowerForCalc = 100; // ステラテラバーストの威力は100
    }
    // テラクラスター、フォトンゲイザーのカテゴリは App.tsx で move.category に反映済みなので、
    // effectiveMoveCategoryForDamageCalc は moveCategoryForCalc (つまり move.category) を使用する。


    // --- 攻撃側ステータスと、攻撃計算に使うカテゴリの決定 ---
    let baseAttackStat: number; // ランク補正済み実数値
    let attackingStatInfoForCrit: StatCalculation; // クリティカル計算用の元ステータス情報
    let categoryForAttackerStatCalc: MoveCategory = effectiveMoveCategoryForDamageCalc; // わざわいのうつわ/おふだ判定用

    if (isPsyshockLike) {
        baseAttackStat = attackerStats.specialAttack.final;
        attackingStatInfoForCrit = attackerStats.specialAttack;
        categoryForAttackerStatCalc = 'special'; // サイコショックは特殊攻撃として災補正を受ける
    } else if (isBodyPress) {
        baseAttackStat = attackerStats.defense.final; // ボディプレスは防御を参照
        attackingStatInfoForCrit = attackerStats.defense;
        categoryForAttackerStatCalc = 'physical';
    } else if (effectiveMoveCategoryForDamageCalc === 'physical') { // フォトンゲイザー物理時もここ
        baseAttackStat = attackerStats.attack.final;
        attackingStatInfoForCrit = attackerStats.attack;
        categoryForAttackerStatCalc = 'physical';
    } else { // Special (フォトンゲイザー特殊時もここ)
        baseAttackStat = attackerStats.specialAttack.final;
        attackingStatInfoForCrit = attackerStats.specialAttack;
        categoryForAttackerStatCalc = 'special';
    }

    const finalAttackStat = calculateFinalAttack(
        baseAttackStat,
        attackerAbility,
        attackerItem,
        defenderAbility,
        categoryForAttackerStatCalc, // 攻撃実数値計算時の災補正用カテゴリ
        moveTypeForCalc as PokemonType,
        disasters,
        isAttackerProtosynthesisActive,
        attackerProtosynthesisBoostedStat,
        isAttackerQuarkDriveActive,
        attackerQuarkDriveBoostedStat,
        weather,
        field,
      　attackerStats.abilityUiFlags // ★ attackerStats 
    );

    // --- 防御側ステータスと、防御計算に使うカテゴリの決定 ---
    let baseDefenseStat: number; // ランク補正済み実数値
    let defendingStatInfoForCrit: StatCalculation; // クリティカル計算用の元ステータス情報
    let categoryForDefenderStatCalc: MoveCategory = effectiveMoveCategoryForDamageCalc; // わざわいのたま/つるぎ判定用

    if (isPsyshockLike) { // サイコショック/サイコブレイクは相手の防御を参照
        baseDefenseStat = defenderStats.defense.final;
        defendingStatInfoForCrit = defenderStats.defense;
        categoryForDefenderStatCalc = 'physical'; // 災補正は物理防御ダウン
    } else if (effectiveMoveCategoryForDamageCalc === 'physical') { // フォトンゲイザー物理時もここ
        baseDefenseStat = defenderStats.defense.final;
        defendingStatInfoForCrit = defenderStats.defense;
        categoryForDefenderStatCalc = 'physical';
    } else { // Special (フォトンゲイザー特殊時もここ)
        baseDefenseStat = defenderStats.specialDefense.final;
        defendingStatInfoForCrit = defenderStats.specialDefense;
        categoryForDefenderStatCalc = 'special';
    }

    const finalDefenseStat = calculateFinalDefense(
        baseDefenseStat,
        defender, // defenderPokemon の代わりに defender を渡す
        defenderItem,
        defenderAbility,
        categoryForDefenderStatCalc, // 防御実数値計算時の災補正用カテゴリ
        weather,
        disasters,
        isDefenderProtosynthesisActive,
        defenderProtosynthesisBoostedStat,
        isDefenderQuarkDriveActive,
        defenderQuarkDriveBoostedStat
    );

    // --- クリティカルヒット時の攻撃側ステータス計算 ---
    // ランク補正：攻撃側のマイナスランク、防御側のプラスランクは無視
    const attackerCritRank = attackingStatInfoForCrit.rank < 0 ? 0 : attackingStatInfoForCrit.rank;
    let critAttackerBaseStat: number; // calculateStatで計算した、クリティカル時ランク補正適用後の基本ステータス値

    if (isPsyshockLike) {
        critAttackerBaseStat = calculateStat(
            attacker.baseStats.specialAttack, attackingStatInfoForCrit.statPoints, level,
            attackingStatInfoForCrit.nature, false, attackerCritRank, attackerItem,
            true, true, false // isCriticalHit, isAttackStatForCritRank, isDefenseStatForCritRank
        );
    } else if (isBodyPress) {
        critAttackerBaseStat = calculateStat(
            attacker.baseStats.defense, attackingStatInfoForCrit.statPoints, level,
            attackingStatInfoForCrit.nature, false, attackerCritRank, attackerItem,
            true, true, false
        );
    } else if (categoryForAttackerStatCalc === 'physical') {
        critAttackerBaseStat = calculateStat(
            attacker.baseStats.attack, attackingStatInfoForCrit.statPoints, level,
            attackingStatInfoForCrit.nature, false, attackerCritRank, attackerItem,
            true, true, false
        );
    } else { // Special
        critAttackerBaseStat = calculateStat(
            attacker.baseStats.specialAttack, attackingStatInfoForCrit.statPoints, level,
            attackingStatInfoForCrit.nature, false, attackerCritRank, attackerItem,
            true, true, false
        );
    }

    const critFinalAttackStat = calculateFinalAttack( // 災などの補正は再度適用
        critAttackerBaseStat,
        attackerAbility,
        attackerItem,
        defenderAbility,
        categoryForAttackerStatCalc, // 通常時と同じ災補正用カテゴリ
        moveTypeForCalc as PokemonType,
        disasters,
        isAttackerProtosynthesisActive,
        attackerProtosynthesisBoostedStat,
        isAttackerQuarkDriveActive,
        attackerQuarkDriveBoostedStat,
        weather,
        field,
      　attackerStats.abilityUiFlags // ★ attackerStats
    );

    // --- クリティカルヒット時の防御側ステータス計算 ---
    const defenderCritRank = defendingStatInfoForCrit.rank > 0 ? 0 : defendingStatInfoForCrit.rank;
    let critDefenderBaseStat: number;

    if (isPsyshockLike) {
        critDefenderBaseStat = calculateStat(
            defender.baseStats.defense, defendingStatInfoForCrit.statPoints, level,
            defendingStatInfoForCrit.nature, false, defenderCritRank, defenderItem,
            true, false, true // isCriticalHit, isAttackStatForCritRank, isDefenseStatForCritRank
        );
    } else if (categoryForDefenderStatCalc === 'physical') {
         critDefenderBaseStat = calculateStat(
            defender.baseStats.defense, defendingStatInfoForCrit.statPoints, level,
            defendingStatInfoForCrit.nature, false, defenderCritRank, defenderItem,
            true, false, true
        );
    } else { // Special
        critDefenderBaseStat = calculateStat(
            defender.baseStats.specialDefense, defendingStatInfoForCrit.statPoints, level,
            defendingStatInfoForCrit.nature, false, defenderCritRank, defenderItem,
            true, false, true
        );
    }

    const critFinalDefenseStat = calculateFinalDefense( // 災などの補正は再度適用
        critDefenderBaseStat,
        defender,
        defenderItem,
        defenderAbility,
        categoryForDefenderStatCalc, // 通常時と同じ災補正用カテゴリ
        weather,
        disasters,
        isDefenderProtosynthesisActive,
        defenderProtosynthesisBoostedStat,
        isDefenderQuarkDriveActive,
        defenderQuarkDriveBoostedStat
    );

    const attackerWithGrounded = { ...attacker, isGrounded: true }; // TODO: isGroundedの正確な判定 (finalPowerCalculatorで利用)
    const finalMovePower = calculateFinalMovePower(
        attackerWithGrounded,
        move, // ここで渡す move は getEffectiveMoveProperties を通った後のもの
        field,
        attackerItem,
        attackerAbility,
      　defenderAbility,
        attackerTeraType, // 通常テラスタイプ
        hasHelpingHand,
        weather,
        moveUiOptionStates,
        movePowerForCalc, // テラバースト(ステラ)の威力100など、変動後の可能性あり
        defender,
        isStellarTeraAttacker // ステラ状態か
    );

    // --- ダメージ計算の基本部分 (レベル補正、威力、攻防適用) ---
    let damageInitial = Math.floor((level * 2 / 5) + 2);
    damageInitial = Math.floor(damageInitial * finalMovePower * finalAttackStat / Math.max(1, finalDefenseStat));
    damageInitial = Math.floor(damageInitial / 50) + 2;

    let critDamageInitial = Math.floor((level * 2 / 5) + 2);
    critDamageInitial = Math.floor(critDamageInitial * finalMovePower * critFinalAttackStat / Math.max(1, critFinalDefenseStat));
    critDamageInitial = Math.floor(critDamageInitial / 50) + 2;

    let baseDamageForCalc = damageInitial;
    let critBaseDamageForCalc = critDamageInitial;

    // ×複数対象3072÷4096→五捨五超入
    if (isDoubleBattle && move.isSpread) { // move.isSpread は moveEffects.ts でテラクラスターの場合などにtrueに設定
        baseDamageForCalc = multiplyByQ12AndRound(baseDamageForCalc, 3072);
        critBaseDamageForCalc = multiplyByQ12AndRound(critBaseDamageForCalc, 3072);
    }

    // ×おやこあい補正（範囲補正の後、天気補正の前）×Q12→五捨五超入
    // 1.0 → 4096 (等倍)、0.25 → 1024
    if (parentalBondMultiplier !== 1.0) {
        const pbQ12 = Math.round(parentalBondMultiplier * 4096);
        baseDamageForCalc = multiplyByQ12AndRound(baseDamageForCalc, pbQ12);
        critBaseDamageForCalc = multiplyByQ12AndRound(critBaseDamageForCalc, pbQ12);
    }

    let weatherDamageMultiplierQ12 = 4096;
    if (move.id === 'hydrosteam' && (weather === 'sun' || weather === 'harsh_sunlight')) {
        weatherDamageMultiplierQ12 = 6144;
    } 
    // 通常の天候補正
    else if (weather === 'sun' || weather === 'harsh_sunlight') {
        if (moveTypeForCalc === 'fire') {
            weatherDamageMultiplierQ12 = 6144; // 1.5倍
        } else if (moveTypeForCalc === 'water') {
            weatherDamageMultiplierQ12 = 2048; // 0.5倍
        }
    } else if (weather === 'rain' || weather === 'heavy_rain') {
        if (moveTypeForCalc === 'water') {
            weatherDamageMultiplierQ12 = 6144; // 1.5倍
        } else if (moveTypeForCalc === 'fire') {
            weatherDamageMultiplierQ12 = 2048; // 0.5倍
        }
    }

    if (weatherDamageMultiplierQ12 !== 4096) {
        baseDamageForCalc = multiplyByQ12AndRound(baseDamageForCalc, weatherDamageMultiplierQ12);
        critBaseDamageForCalc = multiplyByQ12AndRound(critBaseDamageForCalc, weatherDamageMultiplierQ12);
    }

    // ×急所 6144÷4096→五捨五超入 (クリティカルダメージにのみ適用)
    // 通常ダメージは変更なし
    critBaseDamageForCalc = multiplyByQ12AndRound(critBaseDamageForCalc, 6144);

    const randomNumbers = [0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.00];
    const calculatedDamagesHolder: { nonCrit: number[], crit: number[] } = { nonCrit: [], crit: [] };

    // ×タイプ一致... またはステラ... →五捨五超入
    let stabOrStellarMultiplierQ12 = 4096; // 1倍
    // move.type は getEffectiveMoveProperties や App.tsx でのカテゴリ変更を経た後のタイプ
    // attacker.types はポケモンの元々のタイプ
    const isOriginalTypeMatch = attacker.types.includes(move.type as PokemonType);

    if (isTerapagosStellarFormUsingStarstorm) { // テラパゴス(ステラ)のテラクラスター
        stabOrStellarMultiplierQ12 = 4915; // 1.2倍 (ステラ補正)
    } else if (isStellarTeraAttacker) { // ステラ状態
        if (move.isTeraBlast) { // ステラテラバースト
             stabOrStellarMultiplierQ12 = isOriginalTypeMatch ? 8192 : 4915; // 元タイプ一致なら2倍、不一致なら1.2倍
        } else { // ステラ状態でテラバースト以外の技
             if (attacker.types.includes(move.type)) { // 元タイプと技タイプが一致 (スキン特性考慮前の技タイプを見るべきか要確認)
                 stabOrStellarMultiplierQ12 = 8192; // 2倍 (STAB扱い)
             } else {
                 stabOrStellarMultiplierQ12 = 4915; // 1.2倍 (ステラ補正)
             }
        }
    } else if (attackerTeraType && attackerTeraType === (moveTypeForCalc as PokemonType)) { // 通常テラスでタイプ一致
        if (attackerAbility?.id === 'adaptability') {
            stabOrStellarMultiplierQ12 = attacker.types.includes(attackerTeraType) ? 9216 : 8192; // 元々タイプ一致なら2.25倍、テラスで初一致なら2倍
        } else {
            stabOrStellarMultiplierQ12 = attacker.types.includes(attackerTeraType) ? 8192 : 6144; // 元々タイプ一致なら2倍、テラスで初一致なら1.5倍
        }
    } else if (attacker.types.includes(moveTypeForCalc as PokemonType)) { // テラスなしでタイプ一致
        stabOrStellarMultiplierQ12 = attackerAbility?.id === 'adaptability' ? 8192 : 6144; // 適応力なら2倍、通常1.5倍
    }


    // ×タイプ相性→切り捨て
    const validDefenderTypes = defender.types.filter(type => type != null) as PokemonType[];
    let effectivenessValue = 1;

    if (isTerapagosStellarFormUsingStarstorm) {
        effectivenessValue = defenderIsTerastallized ? 2 : 1; // テラパゴス(ステラ)のテラクラスターは相手テラス時抜群
    } else if (move.isTeraBlast && isStellarTeraAttacker && defenderIsTerastallized) {
         // ステラテラバーストで相手がテラスタル時
         // moveTypeForCalc は 'normal' になっているが、相性は抜群として扱う
        effectivenessValue = 2;
    } else {
        effectivenessValue = calculateEffectiveness(moveTypeForCalc as PokemonType, move.id, validDefenderTypes);
    }

    // テラスシェルの効果: 相性が1倍以上なら0.5倍にする
    if (defenderAbility?.id === 'terashell' && effectivenessValue >= 1 && defender.baseStats.hp === defenderStats.hp.final) { // HP満タン時のみ
        effectivenessValue = 0.5;
    }
    const safeEffectivenessValue = isNaN(effectivenessValue) ? 1 : effectivenessValue;


    // ×ダメージの補正値÷4096→五捨五超入 (M値)
    const mValueQ12ForNonCrit = calculateMValueQ12(
        move,
        isDoubleBattle,
        hasReflect,
        hasLightScreen,
        attackerAbility,
        defenderAbility,
        attackerItem,
        defenderItem,
        safeEffectivenessValue,
        false, // isCriticalHit
        hasFriendGuard,
        isFirstHit // 初回ヒットフラグ
    );

    const mValueQ12ForCrit = calculateMValueQ12(
        move,
        isDoubleBattle,
        false, // hasReflect
        false, // hasLightScreen
        attackerAbility,
        defenderAbility,
        attackerItem,
        defenderItem,
        safeEffectivenessValue,
        true, // isCriticalHit
        hasFriendGuard,
        isFirstHit // 初回ヒットフラグ
    );

    for (const randomNumber of randomNumbers) {
        let currentNonCritDamage = baseDamageForCalc;
        // ×乱数(0.85, 0.86, …… 0.99, 1.00 の何れか)→切り捨て
        currentNonCritDamage = Math.floor(currentNonCritDamage * randomNumber);

        if (stabOrStellarMultiplierQ12 !== 4096) {
            currentNonCritDamage = multiplyByQ12AndRound(currentNonCritDamage, stabOrStellarMultiplierQ12);
        }

        currentNonCritDamage = safeEffectivenessValue === 0 ? 0 : Math.floor(currentNonCritDamage * safeEffectivenessValue);

        // ×やけど 2048÷4096→五捨五超入
        // effectiveMoveCategoryForDamageCalc はテラバースト/フォトンゲイザー等で物理になる可能性があるので、それを使う
        if (isBurned && effectiveMoveCategoryForDamageCalc === 'physical' && attackerAbility?.id !== 'guts') {
            currentNonCritDamage = multiplyByQ12AndRound(currentNonCritDamage, 2048);
        }

        currentNonCritDamage = multiplyByQ12AndRound(currentNonCritDamage, mValueQ12ForNonCrit);
        calculatedDamagesHolder.nonCrit.push(Math.max(0, currentNonCritDamage));

        // クリティカルダメージ計算
        let currentCritDamage = critBaseDamageForCalc;
        currentCritDamage = Math.floor(currentCritDamage * randomNumber); // 乱数はクリティカルダメージにもかかる

        if (stabOrStellarMultiplierQ12 !== 4096) {
            currentCritDamage = multiplyByQ12AndRound(currentCritDamage, stabOrStellarMultiplierQ12);
        }

        currentCritDamage = safeEffectivenessValue === 0 ? 0 : Math.floor(currentCritDamage * safeEffectivenessValue);

        // やけどはクリティカルダメージには影響しないのが一般的
        // if (isBurned && effectiveMoveCategoryForDamageCalc === 'physical' && attackerAbility?.id !== 'guts') {
        //     currentCritDamage = multiplyByQ12AndRound(currentCritDamage, 2048);
        // }

        currentCritDamage = multiplyByQ12AndRound(currentCritDamage, mValueQ12ForCrit);
        calculatedDamagesHolder.crit.push(Math.max(0, currentCritDamage));
    }

    const adjustMinDamage = (damages: number[]): number[] => {
        return damages.map(d => {
            if (safeEffectivenessValue === 0 &&
                !isTerapagosStellarFormUsingStarstorm &&
                !(move.isTeraBlast && isStellarTeraAttacker && defenderIsTerastallized)
            ) {
                return 0;
            }
            return Math.max(1, d);
        });
    };

    let adjustedNonCritDamages = calculatedDamagesHolder.nonCrit;
    let adjustedCritDamages = calculatedDamagesHolder.crit;

    // 相性0以外、または特定の技なら最低ダメージ1を保証
    if (safeEffectivenessValue > 0 || isTerapagosStellarFormUsingStarstorm || (move.isTeraBlast && isStellarTeraAttacker && defenderIsTerastallized)) {
        adjustedNonCritDamages = adjustMinDamage(calculatedDamagesHolder.nonCrit);
        adjustedCritDamages = adjustMinDamage(calculatedDamagesHolder.crit);
    } else {
        adjustedNonCritDamages.fill(0);
        adjustedCritDamages.fill(0);
    }

    const minFinalDamage = Math.min(...adjustedNonCritDamages);
    const maxFinalDamage = Math.max(...adjustedNonCritDamages);
    const critMinFinalDamage = Math.min(...adjustedCritDamages);
    const critMaxFinalDamage = Math.max(...adjustedCritDamages);

    const finalDefenderHP = defenderStats.hp.final > 0 ? defenderStats.hp.final : 1;
    const minPercentage = Math.max(0, (minFinalDamage / finalDefenderHP) * 100);
    const maxPercentage = Math.max(0, (maxFinalDamage / finalDefenderHP) * 100);
    const critMinPercentage = Math.max(0, (critMinFinalDamage / finalDefenderHP) * 100);
    const critMaxPercentage = Math.max(0, (critMaxFinalDamage / finalDefenderHP) * 100);

    return {
        minDamage: minFinalDamage,
        maxDamage: maxFinalDamage,
        critMinDamage: critMinFinalDamage,
        critMaxDamage: critMaxFinalDamage,
        minPercentage,
        maxPercentage,
        critMinPercentage,
        critMaxPercentage,
        effectiveness: safeEffectivenessValue,
        teraBoost: stabOrStellarMultiplierQ12 / 4096, // STABまたはステラ補正の倍率
        normalDamages: adjustedNonCritDamages,
        criticalDamages: adjustedCritDamages,
    };
};

/**
 * 複数回ヒットする技のダメージ分布を計算します。
 * @param damagesPerSingleHit - 1ヒットあたりの16通りのダメージ配列。
 * @param hitCount - 技のヒット回数。
 * @returns 複数ヒットを考慮したダメージの全パターンの配列。
 */
export const getMultiHitDamageDistribution = (damagesPerSingleHit: number[], hitCount: number): number[] => {
    if (hitCount <= 1) {
        return damagesPerSingleHit;
    }

    // 4回以上のヒットは計算量が爆発するため、モンテカルロ法で近似する
    if (hitCount > 3) {
        const simulationCount = 30000; // シミュレーション回数
        const distribution: number[] = [];
        for (let i = 0; i < simulationCount; i++) {
            let totalDamage = 0;
            for (let j = 0; j < hitCount; j++) {
                // 1ヒットあたりのダメージをランダムに選択
                const randomIndex = Math.floor(Math.random() * damagesPerSingleHit.length);
                totalDamage += damagesPerSingleHit[randomIndex];
            }
            distribution.push(totalDamage);
        }
        return distribution;
    }

    // 3回ヒットまで (16^3 = 4096) は全通り計算
    let accumulatedDamages: number[] = [...damagesPerSingleHit];

    for (let i = 2; i <= hitCount; i++) {
        const nextAccumulatedDamages: number[] = [];
        for (const accumulatedDamage of accumulatedDamages) {
            for (const singleHitDamage of damagesPerSingleHit) {
                nextAccumulatedDamages.push(accumulatedDamage + singleHitDamage);
            }
        }
        accumulatedDamages = nextAccumulatedDamages;
    }

    return accumulatedDamages;
};