import { Item, Ability, MoveCategory, Move } from '../types'; 

function applyMultiplierAndRound(currentValue: number, multiplier: number): number {
    const result = (currentValue * multiplier) / 4096;
    return Math.round(result);
}

export function multiplyByQ12AndRound(baseValue: number, q12Multiplier: number): number {
    if (q12Multiplier === 4096) {
        return baseValue;
    }
    const intermediateA = baseValue * q12Multiplier;

    let resultB = Math.floor(intermediateA / 4096);
    if ((intermediateA % 4096) > 2048) { // 0.5を超える場合に切り上げ
        resultB += 1;
    }
    return resultB;
}

export function calculateMValueQ12(
    selectedMove: Move | null,      
    isDoubleBattle: boolean,
    hasReflect: boolean,
    hasLightScreen: boolean,
    attackerAbility: Ability | null, 
    defenderAbility: Ability | null,
    attackerItem: Item | null,
    defenderItem: Item | null,
    effectivenessValue: number,
    isCriticalHit: boolean,
    hasFriendGuard: boolean,
    isFirstHit: boolean = true // 初回ヒットか？（2発目以降はマルチスケイル等発動不可）
): number {
    let mValueQ12 = 4096; 
  
    if (!selectedMove || !selectedMove.category) {
        return mValueQ12;
    }

    // 1. 壁補正
    if (!isCriticalHit) { // 急所時は壁無効
        if (hasReflect && selectedMove.category === 'physical') {
            mValueQ12 = isDoubleBattle ? 2732 : 2048; // リフレクター (ダブルバトル時は0.66倍、シングルは0.5倍)
        } else if (hasLightScreen && selectedMove.category === 'special') {
            mValueQ12 = isDoubleBattle ? 2732 : 2048; // ひかりのかべ (ダブルバトル時は0.66倍、シングルは0.5倍)
        }
    }

    // 2. アクセルブレイク
    if (selectedMove.id === 'collisioncourse' && effectivenessValue > 1) {
         mValueQ12 = applyMultiplierAndRound(mValueQ12, 5461);
    }

    // 3. イナズマドライブ
    if (selectedMove.id === 'lightning_drive' && effectivenessValue > 1) {
         mValueQ12 = applyMultiplierAndRound(mValueQ12, 5461);
    }

    // 4. マルチスケイル（初回ヒット時のみ）
    if (isFirstHit && defenderAbility?.id === 'multiscale') {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 2048); 
    }
    // ファントムガード（初回ヒット時のみ）
    if (isFirstHit && defenderAbility?.id === 'shadowshield') {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 2048); 
    }
    // 5. フレガ
    if (hasFriendGuard) {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 3072); 
    }

     // ハードロック
    if (defenderAbility?.id === 'solidrock') {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 3072); 
    }

    if (defenderAbility?.id === 'filter') {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 3072); 
    }

    if (defenderAbility?.id === 'prismarmor') {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 3072); 
    }


    // 6. たつじんのおび
    if (attackerItem?.name === "たつじんのおび" && effectivenessValue > 1) {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 4915); 
    }

    // 7. いのちのたま
    if (attackerItem?.name === "いのちのたま") {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 5324);
    }

    if (defenderItem?.name === "半減きのみ" && effectivenessValue > 1) {
        mValueQ12 = applyMultiplierAndRound(mValueQ12, 2048); 
    }

    return mValueQ12;
}