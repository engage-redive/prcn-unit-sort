// App.tsx の修正版（全文）

import { useState, useEffect, useMemo } from 'react';
import { pokedex } from './data/pokedex';
import { moves } from './data/moves';
import { items } from './data/items';
import { abilities } from './data/abilities';
import { natures } from './data/natures';
import {
    DamageCalculation, NatureModifier, PokemonType,

    AttackerDetailsForModal,
    DefenderDetailsForModal, AttackerStateSnapshotForLog,
    DefenderStateSnapshotForLog, StatCalculation,
} from './types';
import { calculateDamage } from './utils/calculator';
import AttackerPanel from './components/AttackerPanel';
import DefenderPanel from './components/DefenderPanel';
import DamageResult from './components/DamageResult';
import WeatherField from './components/WeatherField';
import TeamManager from './components/TeamManager';
import HistoryTab from './components/HistoryTab';
import { ArrowRightLeft, Calculator, Users, History as HistoryIcon, Info, X } from 'lucide-react';

import { useGlobalStateStore } from './stores/globalStateStore';
import { useAttackerStore } from './stores/attackerStore';
import { useDefenderStore } from './stores/defenderStore';
import { useHistoryStore } from './stores/historyStore';

const HP_DEPENDENT_MOVE_NAMES = ["ふんか", "しおふき", "ドラゴンエナジー"]; // ★ 修正: ドラゴンエナジーを追加

type TabType = 'damage' | 'team' | 'history';
type MobileViewMode = 'attacker' | 'defender';

const InfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center space-y-4 text-center">
                    <a href="https://forms.gle/pwUHbegaWsiKbcgs6" target="_blank" rel="noopener noreferrer" className="text-lg text-blue-400 hover:text-blue-300 transition-colors">要望・バグ報告</a>
                    <div className="border-t border-gray-600 w-full pt-4 mt-2">
                        <p className="text-sm text-gray-300">
                            管理者: <a href="https://x.com/voiceroid_g_c" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@voiceroid_g_c</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


function App() {
    const [activeTab, setActiveTab] = useState<TabType>('damage');
    const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>('attacker');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const { isDoubleBattle, weather, field, disasters, hasReflect, hasLightScreen, hasFriendGuard, defenderIsTerastallized } = useGlobalStateStore();
    const { attackers } = useAttackerStore();
    const {
        pokemon: defenderPokemon, item: defenderItem, ability: defenderAbility,
        hpStat: defenderHpStat, defenseStat: defenderDefenseStat, specialDefenseStat: defenderSpecialDefenseStat,
        attackStat: defenderAttackStat, speedStat: defenderSpeedStat,
        userModifiedTypes, defender2Item, defender2Ability,
        protosynthesisBoostedStat: defenderProtosynthesisBoostedStat,
        protosynthesisManualTrigger: defenderProtosynthesisManualTrigger,
        quarkDriveBoostedStat: defenderQuarkDriveBoostedStat,
        quarkDriveManualTrigger: defenderQuarkDriveManualTrigger,
    } = useDefenderStore();
    const { addLog } = useHistoryStore();

    const [damageResults, setDamageResults] = useState<(DamageCalculation | null)[]>([]);
    const [showAllIndividualAttackResults, setShowAllIndividualAttackResults] = useState(true);

    useEffect(() => {
        const handleSwitchToDamageTab = () => {
            setActiveTab('damage');
        };

        window.addEventListener('switchToDamageTab', handleSwitchToDamageTab);
        return () => {
            window.removeEventListener('switchToDamageTab', handleSwitchToDamageTab);
        };
    }, []);

    const handleSwap = () => {
        const attackerToSwap = JSON.parse(JSON.stringify(useAttackerStore.getState().attackers[0]));
        const defenderToSwap = JSON.parse(JSON.stringify(useDefenderStore.getState()));

        if (!attackerToSwap?.pokemon || !defenderToSwap.pokemon) {
            alert("入れ替えを行うには、攻撃側1と防御側の両方のポケモンが設定されている必要があります。");
            return;
        }

        useAttackerStore.getState().swapWithDefender(defenderToSwap);
        useDefenderStore.getState().swapWithAttacker(attackerToSwap);

        const attackerWasTerastallized = attackerToSwap.teraType !== null || attackerToSwap.isStellar;
        useGlobalStateStore.getState().setDefenderIsTerastallized(attackerWasTerastallized);
    };

    const defenderCurrentTypes = useMemo((): [PokemonType, PokemonType?] => {
        if (defenderPokemon) {
            if (defenderIsTerastallized && useDefenderStore.getState().teraType) return [useDefenderStore.getState().teraType as PokemonType];
            if (userModifiedTypes) return userModifiedTypes;
            return [defenderPokemon.types[0], defenderPokemon.types[1] || undefined] as [PokemonType, PokemonType?];
        }
        return ['normal'];
    }, [defenderPokemon, defenderIsTerastallized, userModifiedTypes]);

    useEffect(() => {
        if (!defenderPokemon) {
            setDamageResults([]);
            return;
        }
        const newDamageResults = attackers.map((attackerState, index) => {
            if (!attackerState.isEnabled || !attackerState.pokemon || !attackerState.move) {
                return null;
            }

            const isVariablePowerMove = attackerState.move?.variablePowers && attackerState.move.variablePowers.length > 0;

            if (isVariablePowerMove) {
                const hitStates = attackerState.variableHitStates || [];
                const activeHits = hitStates.map((checked, i) => checked ? i : -1).filter(i => i !== -1);

                if (activeHits.length === 0) return null;

                const hitResults: DamageCalculation[] = [];

                for (const hitIndex of activeHits) {
                    const hitPower = attackerState.move!.variablePowers![hitIndex];
                    let moveForThisHit = { ...attackerState.move!, power: hitPower };

                    if (HP_DEPENDENT_MOVE_NAMES.includes(moveForThisHit.name) && attackerState.actualMaxHp > 0) {
                        const basePower = moves.find(m => m.id === moveForThisHit.id)?.power || 0;
                        moveForThisHit.power = Math.max(1, Math.floor((basePower * attackerState.currentHp) / attackerState.actualMaxHp));
                    }

                    if (attackerState.starstormDeterminedCategory) moveForThisHit.category = attackerState.starstormDeterminedCategory;
                    if (attackerState.photonGeyserDeterminedCategory) moveForThisHit.category = attackerState.photonGeyserDeterminedCategory;

                    const attackerStatsForCalc = {
                        attack: attackerState.move.id === 'foulplay' ? defenderAttackStat : attackerState.attackStat,
                        specialAttack: attackerState.specialAttackStat,
                        defense: attackerState.defenseStat,
                        speed: attackerState.speedStat,
                        abilityUiFlags: attackerState.abilityUiFlags,
                    };
                    const attackerTeraBlastConfig = {
                        actualType: attackerState.teraBlastDeterminedType,
                        actualCategory: attackerState.teraBlastDeterminedCategory,
                    };
                    const currentDefenderItem = index === 1 && attackers[1]?.isEnabled ? defender2Item : defenderItem;
                    const currentDefenderAbility = index === 1 && attackers[1]?.isEnabled ? defender2Ability : defenderAbility;
                    const isAttackerProtosynthesisActive = attackerState.ability?.id === 'protosynthesis' && attackerState.protosynthesisBoostedStat !== null && ((attackerState.item?.name === 'ブーストエナジー') || (weather === 'sun' || weather === 'harsh_sunlight') || attackerState.protosynthesisManualTrigger);
                    const isAttackerQuarkDriveActive = attackerState.ability?.id === 'quark_drive' && attackerState.quarkDriveBoostedStat !== null && ((attackerState.item?.name === 'ブーストエナジー') || field === 'electric' || attackerState.quarkDriveManualTrigger);
                    const isDefenderProtosynthesisActive = currentDefenderAbility?.id === 'protosynthesis' && defenderProtosynthesisBoostedStat !== null && ((currentDefenderItem?.name === 'ブーストエナジー') || (weather === 'sun' || weather === 'harsh_sunlight') || defenderProtosynthesisManualTrigger);
                    const isDefenderQuarkDriveActive = currentDefenderAbility?.id === 'quark_drive' && defenderQuarkDriveBoostedStat !== null && ((currentDefenderItem?.name === 'ブーストエナジー') || field === 'electric' || defenderQuarkDriveManualTrigger);

                    // hitResultsが空 = まだ1発も計算していない = 初回ヒット（マルチスケイル/ファントムガード有効）
                    const isFirstHitForThisHit = hitResults.length === 0;

                    const defenderTypesArray = defenderCurrentTypes.filter((t): t is PokemonType => t !== undefined);
                    const damageResultForHit = calculateDamage(
                        attackerState.pokemon, { ...defenderPokemon, types: defenderTypesArray }, moveForThisHit,
                        attackerStatsForCalc,
                        { defense: defenderDefenseStat, specialDefense: defenderSpecialDefenseStat, hp: defenderHpStat, speed: defenderSpeedStat, attack: defenderAttackStat },
                        field, attackerState.item, currentDefenderItem, attackerState.teraType, attackerState.isStellar, 50,
                        isDoubleBattle, attackerState.isBurned, attackerState.hasHelpingHand, hasReflect, hasLightScreen,
                        attackerState.ability, null, currentDefenderAbility, null, weather, disasters, hasFriendGuard,
                        attackerTeraBlastConfig, defenderIsTerastallized,
                        isAttackerProtosynthesisActive, attackerState.protosynthesisBoostedStat,
                        isDefenderProtosynthesisActive, defenderProtosynthesisBoostedStat,
                        isAttackerQuarkDriveActive, attackerState.quarkDriveBoostedStat,
                        isDefenderQuarkDriveActive, defenderQuarkDriveBoostedStat,
                        attackerState.moveUiOptionStates,
                        attackerState.abilityUiFlags,
                        1.0,                 // parentalBondMultiplier
                        isFirstHitForThisHit // isFirstHit: マルチスケイル/ファントムガード制御
                    );
                    hitResults.push(damageResultForHit);
                }


                const finalCombinedResult: DamageCalculation = {
                    minDamage: 0, maxDamage: 0, critMinDamage: 0, critMaxDamage: 0,
                    minPercentage: 0, maxPercentage: 0, critMinPercentage: 0, critMaxPercentage: 0,
                    effectiveness: hitResults.length > 0 ? hitResults[0].effectiveness : 1,
                    teraBoost: hitResults.length > 0 ? hitResults[0].teraBoost : 1,
                    normalDamages: Array(16).fill(0),
                    criticalDamages: Array(16).fill(0),
                };

                for (const res of hitResults) {
                    for (let i = 0; i < 16; i++) {
                        finalCombinedResult.normalDamages[i] += res.normalDamages[i];
                        finalCombinedResult.criticalDamages[i] += res.criticalDamages[i];
                    }
                }

                if (defenderHpStat.final > 0) {
                    finalCombinedResult.minDamage = Math.min(...finalCombinedResult.normalDamages);
                    finalCombinedResult.maxDamage = Math.max(...finalCombinedResult.normalDamages);
                    finalCombinedResult.critMinDamage = Math.min(...finalCombinedResult.criticalDamages);
                    finalCombinedResult.critMaxDamage = Math.max(...finalCombinedResult.criticalDamages);

                    finalCombinedResult.minPercentage = (finalCombinedResult.minDamage / defenderHpStat.final) * 100;
                    finalCombinedResult.maxPercentage = (finalCombinedResult.maxDamage / defenderHpStat.final) * 100;
                    finalCombinedResult.critMinPercentage = (finalCombinedResult.critMinDamage / defenderHpStat.final) * 100;
                    finalCombinedResult.critMaxPercentage = (finalCombinedResult.critMaxDamage / defenderHpStat.final) * 100;
                }

                return finalCombinedResult;

            } else {
                let moveForCalc = attackerState.effectiveMove || attackerState.move;
                if (!moveForCalc) return null;

                if (attackerState.starstormDeterminedCategory) {
                    moveForCalc = { ...moveForCalc, category: attackerState.starstormDeterminedCategory };
                }
                if (attackerState.photonGeyserDeterminedCategory) {
                    moveForCalc = { ...moveForCalc, category: attackerState.photonGeyserDeterminedCategory };
                }

                if (attackerState.move?.isRankBasedPower && attackerState.moveUiOptionStates?.['rankBasedPowerValue'] !== undefined) {
                    moveForCalc.power = attackerState.moveUiOptionStates['rankBasedPowerValue'];
                }

                if (HP_DEPENDENT_MOVE_NAMES.includes(moveForCalc.name) && attackerState.actualMaxHp > 0) {
                    const basePower = moves.find(m => m.id === attackerState.move?.id)?.power || 0;
                    moveForCalc.power = Math.max(1, Math.floor((basePower * attackerState.currentHp) / attackerState.actualMaxHp));
                }

                const attackerStatsForCalc = {
                    attack: attackerState.move.id === 'foulplay' ? defenderAttackStat : attackerState.attackStat,
                    specialAttack: attackerState.specialAttackStat,
                    defense: attackerState.defenseStat,
                    speed: attackerState.speedStat,
                    abilityUiFlags: attackerState.abilityUiFlags,
                };

                const attackerTeraBlastConfig = {
                    actualType: attackerState.teraBlastDeterminedType,
                    actualCategory: attackerState.teraBlastDeterminedCategory,
                };

                const currentDefenderItem = index === 1 && attackers[1]?.isEnabled ? defender2Item : defenderItem;
                const currentDefenderAbility = index === 1 && attackers[1]?.isEnabled ? defender2Ability : defenderAbility;

                const isAttackerProtosynthesisActive = attackerState.ability?.id === 'protosynthesis' && attackerState.protosynthesisBoostedStat !== null && ((attackerState.item?.name === 'ブーストエナジー') || (weather === 'sun' || weather === 'harsh_sunlight') || attackerState.protosynthesisManualTrigger);
                const isAttackerQuarkDriveActive = attackerState.ability?.id === 'quark_drive' && attackerState.quarkDriveBoostedStat !== null && ((attackerState.item?.name === 'ブーストエナジー') || field === 'electric' || attackerState.quarkDriveManualTrigger);

                const isDefenderProtosynthesisActive = currentDefenderAbility?.id === 'protosynthesis' && defenderProtosynthesisBoostedStat !== null && ((currentDefenderItem?.name === 'ブーストエナジー') || (weather === 'sun' || weather === 'harsh_sunlight') || defenderProtosynthesisManualTrigger);
                const isDefenderQuarkDriveActive = currentDefenderAbility?.id === 'quark_drive' && defenderQuarkDriveBoostedStat !== null && ((currentDefenderItem?.name === 'ブーストエナジー') || field === 'electric' || defenderQuarkDriveManualTrigger);

                const defenderTypesArray = defenderCurrentTypes.filter((t): t is PokemonType => t !== undefined);

                const calcArgs = [
                    attackerState.pokemon, { ...defenderPokemon, types: defenderTypesArray }, moveForCalc,
                    attackerStatsForCalc,
                    { defense: defenderDefenseStat, specialDefense: defenderSpecialDefenseStat, hp: defenderHpStat, speed: defenderSpeedStat, attack: defenderAttackStat },
                    field, attackerState.item, currentDefenderItem, attackerState.teraType, attackerState.isStellar, 50,
                    isDoubleBattle, attackerState.isBurned, attackerState.hasHelpingHand, hasReflect, hasLightScreen,
                    attackerState.ability, null, currentDefenderAbility, null, weather, disasters, hasFriendGuard,
                    attackerTeraBlastConfig, defenderIsTerastallized,
                    isAttackerProtosynthesisActive, attackerState.protosynthesisBoostedStat,
                    isDefenderProtosynthesisActive, defenderProtosynthesisBoostedStat,
                    isAttackerQuarkDriveActive, attackerState.quarkDriveBoostedStat,
                    isDefenderQuarkDriveActive, defenderQuarkDriveBoostedStat,
                    attackerState.moveUiOptionStates,
                    attackerState.abilityUiFlags,
                ] as const;

                // おやこあい発動条件:
                // 特性がおやこあい、かつ「ダブルバトルの範囲技」ではないこと
                // （シングルバトルでは範囲技でも発動する）
                const isParentalBondAbility = attackerState.ability?.id === 'parental_bond';
                const isSpreadInDouble = isDoubleBattle && !!moveForCalc.isSpread;
                const isParentalBond = isParentalBondAbility && !isSpreadInDouble;

                if (isParentalBond) {
                    // 親（×1.0, 初回ヒット）と子（×0.25, 2発目=マルチスケイル無効）の2回計算
                    const parentResult = calculateDamage(...calcArgs, 1.0, true);
                    const childResult = calculateDamage(...calcArgs, 0.25, false);
                    // 親の結果に子を添付して返す（合計はUI側で計算）
                    return {
                        ...parentResult,
                        parentalBondParent: { ...parentResult },
                        parentalBondChild: childResult,
                    };
                }

                // 連続技かつ防御側がマルチスケイル/ファントムガードを持つ場合:
                // 1発目（isFirstHit=true）と2発目以降（isFirstHit=false）を分けて計算し合算する
                const totalHits = attackerState.selectedHitCount ?? (typeof attackerState.move?.multihit === 'number' ? attackerState.move.multihit : 1);
                const isMultiHitMove = !isVariablePowerMove && totalHits > 1;
                const hasScaleAbility = currentDefenderAbility?.id === 'multiscale' || currentDefenderAbility?.id === 'shadowshield';

                if (isMultiHitMove && hasScaleAbility) {
                    // 1発目: マルチスケイル/ファントムガード有効
                    const firstHitResult = calculateDamage(...calcArgs, 1.0, true);
                    // 2発目以降: マルチスケイル/ファントムガード無効
                    const laterHitResult = calculateDamage(...calcArgs, 1.0, false);
                    const laterHitCount = totalHits - 1;

                    // normalDamages / criticalDamages を合算
                    const combinedNormal = firstHitResult.normalDamages.map(
                        (d, i) => d + laterHitResult.normalDamages[i] * laterHitCount
                    );
                    const combinedCrit = firstHitResult.criticalDamages.map(
                        (d, i) => d + laterHitResult.criticalDamages[i] * laterHitCount
                    );
                    const minDamage = Math.min(...combinedNormal);
                    const maxDamage = Math.max(...combinedNormal);
                    const critMinDamage = Math.min(...combinedCrit);
                    const critMaxDamage = Math.max(...combinedCrit);
                    const hp = defenderHpStat.final > 0 ? defenderHpStat.final : 1;

                    return {
                        ...firstHitResult,
                        normalDamages: combinedNormal,
                        criticalDamages: combinedCrit,
                        minDamage,
                        maxDamage,
                        critMinDamage,
                        critMaxDamage,
                        minPercentage: (minDamage / hp) * 100,
                        maxPercentage: (maxDamage / hp) * 100,
                        critMinPercentage: (critMinDamage / hp) * 100,
                        critMaxPercentage: (critMaxDamage / hp) * 100,
                        isMultiHitCombined: true, // damageCombinedDamageでのhitCount二重掛け算防止フラグ
                    };
                }

                return calculateDamage(...calcArgs, 1.0);


            }
        });
        setDamageResults(newDamageResults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // attackers はオブジェクトの深い変化を検知するため JSON.stringify でシリアライズ
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(attackers),
        // defenderPokemon はIDで比較（オブジェクト参照の変化を避ける）
        defenderPokemon?.id,
        defenderItem?.id,
        defenderAbility?.id,
        // StatCalculation オブジェクトはプリミティブ値に分解
        defenderHpStat.final, defenderHpStat.rank, defenderHpStat.statPoints,
        defenderDefenseStat.final, defenderDefenseStat.rank,
        defenderSpecialDefenseStat.final, defenderSpecialDefenseStat.rank,
        defenderAttackStat.final, defenderAttackStat.rank,
        defenderSpeedStat.final, defenderSpeedStat.rank,
        // defenderCurrentTypes は useMemo で安定化済み
        defenderCurrentTypes,
        isDoubleBattle, hasReflect, hasLightScreen, weather, field,
        // disasters はオブジェクトなので JSON.stringify
        JSON.stringify(disasters),
        hasFriendGuard, defenderIsTerastallized,
        // userModifiedTypes は配列なので JSON.stringify
        JSON.stringify(userModifiedTypes),
        defender2Item?.id, defender2Ability?.id,
        defenderProtosynthesisBoostedStat,
        defenderProtosynthesisManualTrigger,
        defenderQuarkDriveBoostedStat,
        defenderQuarkDriveManualTrigger,
    ]);

    const handleSaveLogEntry = (attackerIdx: number) => {
        const attacker = attackers[attackerIdx];
        const result = damageResults[attackerIdx];
        if (!attacker || !attacker.pokemon || !attacker.move || !result || !defenderPokemon) {
            alert("ログを保存するために必要な情報が不足しています。");
            return;
        }

        const isVariablePowerMove = attacker.move?.variablePowers && attacker.move.variablePowers.length > 0;
        let totalHitCount = 1;
        let moveUsedInCalc = attacker.effectiveMove || attacker.move;

        if (isVariablePowerMove) {
            totalHitCount = attacker.variableHitStates?.filter(Boolean).length || 1;
        } else {
            totalHitCount = attacker.selectedHitCount || (typeof attacker.move.multihit === 'number' ? attacker.move.multihit : 1);
        }

        let attackerDisplayTypes: [PokemonType, PokemonType?] | ['stellar'] = attacker.pokemon.types as [PokemonType, PokemonType?];
        if (attacker.isStellar) attackerDisplayTypes = ['stellar'];
        else if (attacker.teraType) attackerDisplayTypes = [attacker.teraType];

        let moveCategoryForLog = moveUsedInCalc.category;
        if (attacker.teraBlastDeterminedCategory) moveCategoryForLog = attacker.teraBlastDeterminedCategory;
        else if (attacker.starstormDeterminedCategory) moveCategoryForLog = attacker.starstormDeterminedCategory;
        else if (attacker.photonGeyserDeterminedCategory) moveCategoryForLog = attacker.photonGeyserDeterminedCategory;

        let offensiveStatValue = 0, offensiveStatRank = 0, defensiveStatValue = 0, defensiveStatRank = 0;
        let defensiveStatType: 'defense' | 'specialDefense' = 'defense';

        if (attacker.move.id === 'foulplay') {
            offensiveStatValue = defenderAttackStat.final; offensiveStatRank = defenderAttackStat.rank;
            defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
            defensiveStatType = 'defense';
        } else if (attacker.move.id === 'bodypress') {
            offensiveStatValue = attacker.defenseStat.final; offensiveStatRank = attacker.defenseStat.rank;
            defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
            defensiveStatType = 'defense';
        } else if (moveCategoryForLog === 'physical') {
            offensiveStatValue = attacker.attackStat.final; offensiveStatRank = attacker.attackStat.rank;
            defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
            defensiveStatType = 'defense';
        } else {
            offensiveStatValue = attacker.specialAttackStat.final; offensiveStatRank = attacker.specialAttackStat.rank;
            defensiveStatValue = defenderSpecialDefenseStat.final; defensiveStatRank = defenderSpecialDefenseStat.rank;
            defensiveStatType = 'specialDefense';
        }

        const currentDefenderItem = attackerIdx === 1 && attackers[1]?.isEnabled ? defender2Item : defenderItem;
        const currentDefenderAbility = attackerIdx === 1 && attackers[1]?.isEnabled ? defender2Ability : defenderAbility;

        const attackerDetails: AttackerDetailsForModal = { pokemonId: attacker.pokemon.id, pokemonName: attacker.pokemon.name, movePower: moveUsedInCalc.power || 0, moveCategory: moveCategoryForLog, offensiveStatValue, offensiveStatRank, teraType: attacker.teraType, isStellar: attacker.isStellar, item: attacker.item?.name || null, ability: attacker.ability?.name || null, isBurned: attacker.isBurned, hasHelpingHand: attacker.hasHelpingHand, displayTypes: attackerDisplayTypes, };
        const defenderDetails: DefenderDetailsForModal = { pokemonId: defenderPokemon.id, pokemonName: defenderPokemon.name, maxHp: defenderHpStat.final, defensiveStatValue, defensiveStatType, defensiveStatRank, item: currentDefenderItem?.name || null, ability: currentDefenderAbility?.name || null, hasReflect: hasReflect && moveCategoryForLog === 'physical', hasLightScreen: hasLightScreen && moveCategoryForLog === 'special', hasFriendGuard, displayTypes: defenderCurrentTypes, };

        const createStatSnapshot = (stat: StatCalculation): { statPoints: number; nature: NatureModifier; rank: number } => ({ statPoints: stat.statPoints || 0, nature: stat.nature as NatureModifier, rank: stat.rank });
        const attackerStateSnapshot: AttackerStateSnapshotForLog = { pokemonId: attacker.pokemon.id, moveId: attacker.move.id, itemId: attacker.item?.id || null, abilityId: attacker.ability?.id || null, attackStat: createStatSnapshot(attacker.attackStat), specialAttackStat: createStatSnapshot(attacker.specialAttackStat), defenseStat: createStatSnapshot(attacker.defenseStat), speedStat: createStatSnapshot(attacker.speedStat), hpStatPoints: attacker.hpStatPoints, currentHp: attacker.currentHp, teraType: attacker.teraType, loadedTeraType: attacker.loadedTeraType, isStellar: attacker.isStellar, isBurned: attacker.isBurned, hasHelpingHand: attacker.hasHelpingHand, hasFlowerGift: attacker.hasFlowerGift, teraBlastUserSelectedCategory: attacker.teraBlastUserSelectedCategory, starstormDeterminedCategory: attacker.starstormDeterminedCategory, photonGeyserDeterminedCategory: attacker.photonGeyserDeterminedCategory, selectedHitCount: attacker.selectedHitCount, protosynthesisBoostedStat: attacker.protosynthesisBoostedStat, protosynthesisManualTrigger: attacker.protosynthesisManualTrigger, quarkDriveBoostedStat: attacker.quarkDriveBoostedStat, quarkDriveManualTrigger: attacker.quarkDriveManualTrigger, moveUiOptionStates: attacker.moveUiOptionStates, abilityUiFlags: attacker.abilityUiFlags, variableHitStates: attacker.variableHitStates, isCritical: !!attacker.isCritical };
        const defenderStateSnapshot: DefenderStateSnapshotForLog = { pokemonId: defenderPokemon.id, itemId: currentDefenderItem?.id || null, abilityId: currentDefenderAbility?.id || null, hpStat: createStatSnapshot(defenderHpStat), defenseStat: createStatSnapshot(defenderDefenseStat), specialDefenseStat: createStatSnapshot(defenderSpecialDefenseStat), attackStat: createStatSnapshot(defenderAttackStat), speedStat: createStatSnapshot(defenderSpeedStat), hpStatPoints: useDefenderStore.getState().hpStatPoints, teraType: useDefenderStore.getState().teraType, isStellar: useDefenderStore.getState().isStellar, isBurned: useDefenderStore.getState().isBurned, hasFlowerGift: useDefenderStore.getState().hasFlowerGift, userModifiedTypes, protosynthesisBoostedStat: defenderProtosynthesisBoostedStat, protosynthesisManualTrigger: defenderProtosynthesisManualTrigger, quarkDriveBoostedStat: defenderQuarkDriveBoostedStat, quarkDriveManualTrigger: defenderQuarkDriveManualTrigger };
        const globalStatesSnapshot = { isDoubleBattle, weather, field, disasters: JSON.parse(JSON.stringify(disasters)), hasReflect, hasLightScreen, hasFriendGuard, defenderIsTerastallized, };

        addLog({
            attackerDetails, defenderDetails, result,
            defenderOriginalHP: defenderHpStat.final,
            attackerPokemonName: attacker.pokemon.name,
            attackerMoveName: attacker.move.name,
            defenderPokemonName: defenderPokemon.name,
            hitCount: totalHitCount,
            attackerStateSnapshot, defenderStateSnapshot, globalStatesSnapshot
        });
    };

    const calculateCombinedDamage = (results: DamageCalculation[]): { minDamage: number; maxDamage: number; minPercentage: number; maxPercentage: number; } | null => {
        if (results.length === 0 || !defenderHpStat.final || defenderHpStat.final === 0) return null;
        let combinedMin = 0; let combinedMax = 0;
        results.forEach((result, index) => {
            const attackerState = attackers[index];
            if (!attackerState || !attackerState.move) return;

            const isVariablePowerMove = attackerState.move?.variablePowers && attackerState.move.variablePowers.length > 0;
            if (isVariablePowerMove) {
                combinedMin += result.minDamage;
                combinedMax += result.maxDamage;
            } else {
                // isMultiHitCombined=true の場合、result には合算後のダメージが既に格納されているため
                // hitCount を重ねて掛けると二重計算になる。その場合は hitCount=1 として扱う。
                const hitCount = result.isMultiHitCombined
                    ? 1
                    : (attackerState.selectedHitCount || (typeof attackerState.move.multihit === 'number' ? attackerState.move.multihit : 1));
                combinedMin += result.minDamage * hitCount;
                combinedMax += result.maxDamage * hitCount;
            }
        });
        const minPercentage = (combinedMin / defenderHpStat.final) * 100;
        const maxPercentage = (combinedMax / defenderHpStat.final) * 100;
        return { minDamage: Math.floor(combinedMin), maxDamage: Math.floor(combinedMax), minPercentage, maxPercentage };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {activeTab === 'damage' && (
                <div
                    className="md:hidden fixed top-0 left-0 w-full bg-gray-900 shadow-md z-20 flex items-stretch border-b border-gray-700"
                    style={{ height: '56px' }}
                >
                    <button
                        onClick={() => setMobileViewMode('attacker')}
                        className={`flex-1 flex items-center justify-center px-2 py-1 transition-colors text-sm relative focus:outline-none ${mobileViewMode === 'attacker' ? 'text-red-400' : 'text-gray-300 hover:text-white'
                            }`}
                    >
                        <span className="ml-1">攻撃</span>
                        {mobileViewMode === 'attacker' && (<div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>)}
                    </button>
                    {/* ★★★★★ スマホ版ヘッダーに入れ替えボタンを追加 ★★★★★ */}
                    <button
                        onClick={handleSwap}
                        className="flex-none flex items-center justify-center px-3 py-1 text-gray-300 hover:text-white transition-colors focus:outline-none"
                        aria-label="Swap Attacker and Defender"
                    >
                        <ArrowRightLeft className="h-5 w-5" />
                    </button>
                    {/* ★★★★★ ここまで ★★★★★ */}
                    <button
                        onClick={() => setMobileViewMode('defender')}
                        className={`flex-1 flex items-center justify-center px-2 py-1 transition-colors text-sm relative focus:outline-none ${mobileViewMode === 'defender' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                    >
                        <span className="ml-1">防御</span>
                        {mobileViewMode === 'defender' && (<div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>)}
                    </button>
                </div>
            )}
            <header className={`w-full ${activeTab !== 'damage' ? 'pt-0' : (mobileViewMode === 'attacker' || mobileViewMode === 'defender' ? 'pt-[56px] md:pt-0' : 'pt-0')}`}>
                <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-8">
                    <div className="hidden md:flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-white">VGC.calc</h1>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-1 md:space-x-2">
                            <button onClick={() => { setActiveTab('damage'); setMobileViewMode('attacker'); }} className={`flex items-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-3 rounded-lg transition-colors text-xs sm:text-sm md:text-base ${activeTab === 'damage' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}><Calculator className="h-4 w-4 md:h-5 md:w-5" /> ダメ計</button>
                            <button onClick={() => setActiveTab('team')} className={`flex items-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-3 rounded-lg transition-colors text-xs sm:text-sm md:text-base ${activeTab === 'team' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}><Users className="h-4 w-4 md:h-5 md:w-5" /> チーム</button>
                            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-3 rounded-lg transition-colors text-xs sm:text-sm md:text-base ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}><HistoryIcon className="h-4 w-4 md:h-5 md:w-5" /> 履歴</button>
                        </div>
                        <button
                            onClick={() => setIsInfoModalOpen(true)}
                            className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full transition-colors"
                            aria-label="Information"
                        >
                            <Info className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto w-full flex-grow px-1 md:px-10 pb-[calc(50vh-4rem)] pt-2 md:pt-6">
                <div style={{ display: activeTab === 'damage' ? 'block' : 'none' }}>
                    <div className="md:hidden space-y-2">
                        {mobileViewMode === 'attacker' && <AttackerPanel pokemon={pokedex} moves={moves} items={items} abilities={abilities} />}
                        {mobileViewMode === 'defender' && <DefenderPanel pokemonList={pokedex} items={items} abilities={abilities} showDefender2={attackers.length > 1 && !!attackers[1]?.isEnabled} />}
                    </div>

                    {/* ★★★★★ Swapボタンのレイアウトを修正 ★★★★★ */}
                    <div className="hidden md:block relative">
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <AttackerPanel pokemon={pokedex} moves={moves} items={items} abilities={abilities} />
                            <DefenderPanel pokemonList={pokedex} items={items} abilities={abilities} showDefender2={attackers.length > 1 && !!attackers[1]?.isEnabled} />
                        </div>
                        <button
                            onClick={handleSwap}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-all text-gray-300 hover:text-white hover:scale-110 shadow-lg"
                            aria-label="Swap Attacker and Defender"
                        >
                            <ArrowRightLeft className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-6"><WeatherField /></div>
                </div>
                <div style={{ display: activeTab === 'team' ? 'block' : 'none' }}><TeamManager pokemon={pokedex} moves={moves} items={items} abilities={abilities} natures={natures} /></div>
                <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}><HistoryTab /></div>
            </main>
            <div style={{ display: activeTab === 'damage' ? 'block' : 'none' }}>
                <footer className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 shadow-lg z-10 max-h-[calc(60vh-4rem)] overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-2.5 p-2.5">
                            {(() => {
                                const enabledAttackers = attackers.filter(a => a.isEnabled);
                                if (enabledAttackers.length === 0) return <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">攻撃側が設定されていません。</div>;

                                const enabledDamageResults = damageResults.filter((_, i) => attackers[i]?.isEnabled && attackers[i] !== null);
                                if (enabledDamageResults.length === 0 || enabledDamageResults.every(r => r === null)) return <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">有効な計算結果がありません。</div>;

                                const combinedResultsForDisplay = enabledAttackers.length > 1 ? calculateCombinedDamage(enabledDamageResults.filter(r => r !== null) as DamageCalculation[]) : null;

                                return damageResults.map((result, index) => {
                                    const attacker = attackers[index];
                                    if (!attacker?.isEnabled || !result || !attacker.pokemon || !attacker.move || !defenderPokemon) return null;

                                    const isVariablePowerMove = attacker.move?.variablePowers && attacker.move.variablePowers.length > 0;
                                    let totalHitCount = 1;

                                    if (isVariablePowerMove) {
                                        totalHitCount = attacker.variableHitStates?.filter(Boolean).length || 1;
                                    } else {
                                        totalHitCount = attacker.selectedHitCount || (typeof attacker.move.multihit === 'number' ? attacker.move.multihit : 1);
                                    }

                                    let moveUsedInCalc = attacker.effectiveMove || attacker.move;
                                    let attackerDisplayTypes: [PokemonType, PokemonType?] | ['stellar'] = attacker.pokemon.types as [PokemonType, PokemonType?];
                                    if (attacker.isStellar) attackerDisplayTypes = ['stellar'];
                                    else if (attacker.teraType) attackerDisplayTypes = [attacker.teraType];

                                    let moveCategoryForDisplay = moveUsedInCalc.category;
                                    if (attacker.teraBlastDeterminedCategory) moveCategoryForDisplay = attacker.teraBlastDeterminedCategory;
                                    else if (attacker.starstormDeterminedCategory) moveCategoryForDisplay = attacker.starstormDeterminedCategory;
                                    else if (attacker.photonGeyserDeterminedCategory) moveCategoryForDisplay = attacker.photonGeyserDeterminedCategory;

                                    let offensiveStatValue = 0, offensiveStatRank = 0, defensiveStatValue = 0, defensiveStatRank = 0;
                                    let defensiveStatType: 'defense' | 'specialDefense' = 'defense';

                                    if (attacker.move.id === 'foulplay') {
                                        offensiveStatValue = defenderAttackStat.final; offensiveStatRank = defenderAttackStat.rank;
                                        defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
                                        defensiveStatType = 'defense';
                                    } else if (attacker.move.id === 'bodypress') {
                                        offensiveStatValue = attacker.defenseStat.final; offensiveStatRank = attacker.defenseStat.rank;
                                        defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
                                        defensiveStatType = 'defense';
                                    } else if (moveCategoryForDisplay === 'physical') {
                                        offensiveStatValue = attacker.attackStat.final; offensiveStatRank = attacker.attackStat.rank;
                                        defensiveStatValue = defenderDefenseStat.final; defensiveStatRank = defenderDefenseStat.rank;
                                        defensiveStatType = 'defense';
                                    } else {
                                        offensiveStatValue = attacker.specialAttackStat.final; offensiveStatRank = attacker.specialAttackStat.rank;
                                        defensiveStatValue = defenderSpecialDefenseStat.final; defensiveStatRank = defenderSpecialDefenseStat.rank;
                                        defensiveStatType = 'specialDefense';
                                    }

                                    const currentDefenderItem = index === 1 && attackers[1]?.isEnabled ? defender2Item : defenderItem;
                                    const currentDefenderAbility = index === 1 && attackers[1]?.isEnabled ? defender2Ability : defenderAbility;

                                    const attackerDetails: AttackerDetailsForModal = { pokemonId: attacker.pokemon.id, pokemonName: attacker.pokemon.name, movePower: moveUsedInCalc.power || 0, moveCategory: moveCategoryForDisplay, offensiveStatValue, offensiveStatRank, teraType: attacker.teraType, isStellar: attacker.isStellar, item: attacker.item?.name || null, ability: attacker.ability?.name || null, isBurned: attacker.isBurned, hasHelpingHand: attacker.hasHelpingHand, displayTypes: attackerDisplayTypes, };
                                    const defenderDetails: DefenderDetailsForModal = { pokemonId: defenderPokemon.id, pokemonName: defenderPokemon.name, maxHp: defenderHpStat.final, defensiveStatValue, defensiveStatType, defensiveStatRank, item: currentDefenderItem?.name || null, ability: currentDefenderAbility?.name || null, hasReflect: hasReflect && moveCategoryForDisplay === 'physical', hasLightScreen: hasLightScreen && moveCategoryForDisplay === 'special', hasFriendGuard, displayTypes: defenderCurrentTypes, };

                                    return (
                                        <DamageResult
                                            key={`result-${index}`}
                                            attackerIndex={index}
                                            result={result}
                                            defenderHP={defenderHpStat.final}
                                            combinedResult={index === 0 && combinedResultsForDisplay ? combinedResultsForDisplay : undefined}
                                            attackerPokemonName={attacker.pokemon.name}
                                            attackerMoveName={attacker.move.name}
                                            attackerMoveNameForDisplay={moveUsedInCalc.name}
                                            defenderPokemonName={defenderPokemon.name}
                                            hitCount={totalHitCount}
                                            attackerDetails={attackerDetails}
                                            defenderDetails={defenderDetails}
                                            weather={weather !== 'none' ? weather : null}
                                            field={field !== 'none' ? field : null}
                                            disasters={disasters}
                                            onSaveLog={() => handleSaveLogEntry(index)}
                                            resultIdSuffix={`${index}`}
                                            isVariablePowerMove={isVariablePowerMove}
                                            showIndividualAttackResults={showAllIndividualAttackResults}
                                            onToggleShowIndividualAttackResults={() => setShowAllIndividualAttackResults(p => !p)}
                                        />
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </footer>
            </div>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
        </div>
    );
}

export default App;