import { Pokemon, Item, Ability, MoveCategory, Weather, DisasterState, PokemonType, ProtosynthesisBoostTarget, QuarkDriveBoostTarget } from '../types';

function multiplyByQ12AndRound(baseValue: number, q12Multiplier: number): number {
    if (q12Multiplier === 4096) {
        return baseValue;
    }
    const intermediateA = baseValue * q12Multiplier;
    let resultB = Math.floor(intermediateA / 4096);
    if ((intermediateA % 4096) > 2048) {
        resultB += 1;
    }
    return resultB;
}

function roundHalfUp(value: number): number {
    return Math.round(value);
}

function applyQ12EffectAndRound(baseMultiplier: number, q12EffectValue: number): number {
    return roundHalfUp((baseMultiplier * q12EffectValue) / 4096);
}

export const calculateFinalDefense = (
    baseDefenseStat: number, // ランク補正済み実数値
    defenderPokemon: Pokemon, // Pokemonオブジェクト全体を渡す
    defenderItem: Item | null,
    defenderAbility: Ability | null,
    moveCategory: MoveCategory,
    weather: Weather,
    disasters: DisasterState,
    // こだいかっせい関連引数
    isDefenderProtosynthesisActive: boolean,
    defenderProtosynthesisBoostedStat: ProtosynthesisBoostTarget | null,
    // クォークチャージ関連引数
    isDefenderQuarkDriveActive: boolean,
    defenderQuarkDriveBoostedStat: QuarkDriveBoostTarget | null
): number => {
    let modifiedDefense = baseDefenseStat; // 初期値はランク補正済み実数値

    // 天候によるステータス変化 (一部例)
    //
    // 砂嵐時の岩タイプの特防1.5倍
    if (weather === 'sandstorm' && defenderPokemon.types.includes('rock' as PokemonType) && moveCategory === 'special') {
        modifiedDefense = Math.floor(modifiedDefense * 1.5); // 直接1.5倍して切り捨て
    }
    // 雪時の氷タイプの防御1.5倍
    if (weather === 'snow' && defenderPokemon.types.includes('ice' as PokemonType) && moveCategory === 'physical') {
        modifiedDefense = Math.floor(modifiedDefense * 1.5); // 直接1.5倍して切り捨て
    }

    // フラワーギフト（晴れ時、自分と味方の攻撃・特防1.5倍）は特性で処理

    let defenseMultiplierQ12 = 4096; // 初期値は4096 (1倍)

    // 1. わざわいの影響 (場の効果)
    if (disasters.ball && moveCategory === 'special' && defenderAbility?.id !== 'beads_of_ruin') { // わざわいのたま所有者は影響なし
        defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 3072); // 0.75倍
    }
    if (disasters.sword && moveCategory === 'physical' && defenderAbility?.id !== 'sword_of_ruin') { // わざわいのつるぎ所有者は影響なし
        defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 3072); // 0.75倍
    }

    // 2. 防御側の特性による補正
    if (defenderAbility) {
        // こだいかっせい
        if (isDefenderProtosynthesisActive && defenderAbility.id === 'protosynthesis') {
            if (defenderProtosynthesisBoostedStat === 'defense' && moveCategory === 'physical') {
                defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 5325); // 1.3倍
            } else if (defenderProtosynthesisBoostedStat === 'specialDefense' && moveCategory === 'special') {
                defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 5325); // 1.3倍
            }
        }

        // クォークチャージ
        if (isDefenderQuarkDriveActive && defenderAbility.id === 'quark_drive') {
            if (defenderQuarkDriveBoostedStat === 'defense' && moveCategory === 'physical') {
                defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 5325); // 1.3倍
            } else if (defenderQuarkDriveBoostedStat === 'specialDefense' && moveCategory === 'special') {
                defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 5325); // 1.3倍
            }
        }

        // 他の防御系特性
        switch (defenderAbility.id) {
            case 'marvel_scale': // ふしぎなうろこ (状態異常で防御1.5倍)
                // defenderState.isBurned などで判定が必要 (App.tsxから渡す必要あり)
                // ここでは仮に常に発動しないものとする
                break;
            case 'fur_coat': // ファーコート (物理技のダメージ半減 -> 防御2倍)
                if (moveCategory === 'physical') {
                    defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 8192); // 2倍
                }
                break;
            // ...
        }
    }

    // Item effects
    if (defenderItem) {
        switch (defenderItem.name) {
            case 'しんかのきせき':
                defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 6144);
                break;
            case 'とつげきチョッキ':
                if (moveCategory === 'special') {
                    defenseMultiplierQ12 = applyQ12EffectAndRound(defenseMultiplierQ12, 6144);
                }
                break;
        }
    }
    
    let finalDefense = multiplyByQ12AndRound(modifiedDefense, defenseMultiplierQ12);
    return Math.max(1, finalDefense);
};