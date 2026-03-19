import React, { useState } from 'react';
import {
  LoggedDamageEntry,
  PokemonType,
  DisasterState,
} from '../types';
import { useHistoryStore } from '../stores/historyStore';
import { X, Trash2, Info, RotateCcw } from 'lucide-react';

import { moves } from '../data/moves';
import { getPokemonIconPath } from '../utils/uiHelpers';

const TYPE_NAME_JP_HISTORY: Record<string, string> = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき', grass: 'くさ', ice: 'こおり',
  fighting: 'かくとう', poison: 'どく', ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく', steel: 'はがね', fairy: 'フェアリー',
  stellar: 'ステラ',
};

const TYPE_COLORS_HISTORY: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '##705746', steel: '##B7B7CE', fairy: '##D685AD',
  stellar: '##7A7AE6',
};

const WEATHER_NAME_JP_HISTORY: Record<string, string> = {
  'none': 'なし', 'sun': 'はれ', 'rain': 'あめ', 'sandstorm': 'すなあらし', 'snow': 'ゆき',
  'harsh_sunlight': 'おおひでり', 'heavy_rain': 'おおあめ',
};

const FIELD_NAME_JP_HISTORY: Record<string, string> = {
  'none': 'なし', 'electric': 'エレキフィールド', 'grassy': 'グラスフィールド',
  'psychic': 'サイコフィールド', 'misty': 'ミストフィールド',
};

const DISASTER_MAP_HISTORY: { [key in keyof DisasterState]: string } = {
  sword: "わざわいのつるぎ", ball: "わざわいのたま",
  vessel: "わざわいのうつわ", talisman: "わざわいのおふだ",
};

const getTypeNameJpFromHistory = (type: PokemonType | 'stellar' | null | undefined): string => {
  if (!type) return '';
  const typeKey = type.toLowerCase() as keyof typeof TYPE_NAME_JP_HISTORY;
  return TYPE_NAME_JP_HISTORY[typeKey] || typeKey.toString();
};

const getTypeColorFromHistory = (type: PokemonType | 'stellar' | null | undefined): string => {
  if (!type) return '#777777';
  const typeKey = type.toLowerCase() as keyof typeof TYPE_COLORS_HISTORY;
  return TYPE_COLORS_HISTORY[typeKey] || '#777777';
};

const formatPercentageHistory = (percentage: number): string => {
  return Math.max(0, percentage).toFixed(2);
};

const getDamageColorHistory = (percentage: number) => {
  if (percentage >= 100) return 'text-red-500';
  if (percentage >= 75) return 'text-orange-500';
  if (percentage >= 50) return 'text-yellow-500';
  if (percentage >= 25) return 'text-green-500';
  return 'text-white';
};

const calculateKOChanceForHistory = (damagesPerUsage: number[], hp: number, usagesToTest: number): number => {
    if (usagesToTest <= 0) return 0;
    if (hp <= 0) return 100;
    const validDamages = damagesPerUsage.filter(d => typeof d === 'number' && !isNaN(d));
    if (validDamages.length === 0) return 0;
    if (usagesToTest === 1) {
      let koCount = 0;
      for (const damage of validDamages) { if (damage >= hp) koCount++; }
      return (koCount / validDamages.length) * 100;
    }
    const uniqueDamages: number[] = []; const frequencies: number[] = [];
    for (const damage of validDamages) {
      const index = uniqueDamages.indexOf(damage);
      if (index === -1) { uniqueDamages.push(damage); frequencies.push(1); } 
      else { frequencies[index]++; }
    }
    const totalFrequency = validDamages.length;
    if (usagesToTest === 2) { 
        let koProb = 0;
        for (let i = 0; i < uniqueDamages.length; i++) {
            const d1 = uniqueDamages[i], p1 = frequencies[i] / totalFrequency;
            for (let j = 0; j < uniqueDamages.length; j++) {
                const d2 = uniqueDamages[j], p2 = frequencies[j] / totalFrequency;
                if (d1 + d2 >= hp) koProb += p1 * p2;
            }
        }
        return koProb * 100;
    }
    if (usagesToTest === 3) { 
        let koProb = 0;
        for (let i = 0; i < uniqueDamages.length; i++) {
            const d1 = uniqueDamages[i], p1 = frequencies[i] / totalFrequency;
            for (let j = 0; j < uniqueDamages.length; j++) {
                const d2 = uniqueDamages[j], p2 = frequencies[j] / totalFrequency;
                for (let k = 0; k < uniqueDamages.length; k++) {
                    const d3 = uniqueDamages[k], p3 = frequencies[k] / totalFrequency;
                    if (d1 + d2 + d3 >= hp) koProb += p1 * p2 * p3;
                }
            }
        }
        return koProb * 100;
    }
    let prevProbs: Map<number, number> = new Map(); prevProbs.set(0, 1);
    for (let h = 0; h < usagesToTest; h++) {
      const currentProbs: Map<number, number> = new Map();
      for (const [prevTotal, prevProb] of prevProbs.entries()) {
        for (let i = 0; i < uniqueDamages.length; i++) {
          const damage = uniqueDamages[i], freq = frequencies[i] / totalFrequency;
          const newTotal = prevTotal + damage;
          currentProbs.set(newTotal, (currentProbs.get(newTotal) || 0) + prevProb * freq);
        }
      }
      prevProbs = currentProbs;
    }
    let koProb = 0;
    for (const [total, prob] of prevProbs.entries()) { if (total >= hp) koProb += prob; }
    return Math.min(100, koProb * 100);
};

// ★ 修正: isVariablePowerMove を引数に追加
const getKOTextHistory = (
  damagesPerSingleHitDistribution: number[],
  hp: number,
  currentHitCount: number,
  calculateKOChance: (damagesPerUsage: number[], hp: number, usagesToTest: number) => number,
  isVariablePowerMove: boolean, // ★ 引数追加
  showPercentage: boolean = true
): string => {
    if (!damagesPerSingleHitDistribution || damagesPerSingleHitDistribution.length !== 16) {
      return "計算不可";
    }
    if (hp <= 0) return "確定1発";

    // ★ 修正: isVariablePowerMove に応じてヒット数を決定
    const koHitCount = isVariablePowerMove ? 1 : currentHitCount;
    const damagesPerUsage = damagesPerSingleHitDistribution.map(d => d * koHitCount);

    const minDamagePerUsage = Math.min(...damagesPerUsage);
    const maxDamagePerUsage = Math.max(...damagesPerUsage);

    if (maxDamagePerUsage <= 0) return "ダメージなし";
    
    const minUsagesToKO = Math.ceil(hp / maxDamagePerUsage);
    const confirmedUsagesToKO = minDamagePerUsage > 0 ? Math.ceil(hp / minDamagePerUsage) : Infinity;

    if (minUsagesToKO === Infinity && confirmedUsagesToKO === Infinity) return "ダメージなし";
    
    if (minUsagesToKO > 10 && confirmedUsagesToKO > 10) {
        if (confirmedUsagesToKO !== Infinity) return `確定${confirmedUsagesToKO}発`;
        return `乱数${minUsagesToKO}発`;
    }

    if (minUsagesToKO === confirmedUsagesToKO) return `確定${minUsagesToKO}発`;
    
    if (!showPercentage) return `乱数${minUsagesToKO}発`;
    
    const koChanceVal = calculateKOChance(damagesPerUsage, hp, minUsagesToKO);
    if (koChanceVal < 0.01 && koChanceVal > 0) return `乱数${minUsagesToKO}発 (<0.01%)`;
    if (koChanceVal > 99.99 && koChanceVal < 100) return `乱数${minUsagesToKO}発 (>99.99%)`;
    return `乱数${minUsagesToKO}発 (${formatPercentageHistory(koChanceVal)}%)`;
};

const getHpBarColorByRemainingHp = (remainingPercentage: number) => {
  if (remainingPercentage <= 25) return 'bg-red-500';
  if (remainingPercentage <= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getHpRangeBarColorByRemainingHp = (remainingPercentage: number) => {
  if (remainingPercentage <= 25) return 'bg-red-700';
  if (remainingPercentage <= 50) return 'bg-yellow-700';
  return 'bg-green-700';
};

interface LogCardProps {
  logEntry: LoggedDamageEntry;
}

const LogCard: React.FC<LogCardProps> = ({ logEntry }) => {
  const { deleteLog, loadLogToCalculators } = useHistoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    timestamp,
    attackerDetails,
    defenderDetails,
    result,
    defenderOriginalHP,
    attackerPokemonName,
    attackerMoveName,
    defenderPokemonName,
    hitCount,
    attackerStateSnapshot,
    globalStatesSnapshot,
  } = logEntry;

  const isCritical = !!attackerStateSnapshot?.isCritical;

  const moveData = attackerStateSnapshot ? moves.find(m => m.id === attackerStateSnapshot.moveId) : null;
  const isVariablePowerMove = !!(moveData?.variablePowers && moveData.variablePowers.length > 0);

  const displayHitCount = isVariablePowerMove ? 1 : hitCount;

  const isDoubleBattle = globalStatesSnapshot?.isDoubleBattle || false;

  const minDamageDisplay = (isCritical ? result.critMinDamage : result.minDamage) * displayHitCount;
  const maxDamageDisplay = (isCritical ? result.critMaxDamage : result.maxDamage) * displayHitCount;
  
  const minPercentageDisplay = isCritical ? result.critMinPercentage : result.minPercentage;
  const maxPercentageDisplay = isCritical ? result.critMaxPercentage : result.maxPercentage;

  const clampedCurrentDisplayMinPercentageInLog = Math.min(100, minPercentageDisplay);
  const clampedCurrentDisplayMaxPercentageInLog = Math.min(100, maxPercentageDisplay);

  const actualRemainingHPMinPercentageInLog = Math.max(0, 100 - clampedCurrentDisplayMaxPercentageInLog);
  const actualRemainingHPMaxPercentageInLog = Math.max(0, 100 - clampedCurrentDisplayMinPercentageInLog);
  
  const damagesForKO = isCritical ? result.criticalDamages : result.normalDamages;
  const koTextDisplay = getKOTextHistory(
    damagesForKO,
    defenderOriginalHP,
    hitCount,
    calculateKOChanceForHistory,
    isVariablePowerMove 
  );
  
  const handleDeleteClick = () => {
    deleteLog(logEntry.id);
  };

  const handleLoadClick = () => {
    const success = loadLogToCalculators(logEntry.id);
    if (success) {
      setIsModalOpen(false);
      const event = new CustomEvent('switchToDamageTab');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
            <span className="text-xs text-gray-400">
                {new Date(timestamp).toLocaleString()}
                {isDoubleBattle && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">ダブル</span>}
                {isCritical && <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">急所</span>}
            </span>
        </div>
        <button
          onClick={handleDeleteClick}
          className="text-red-400 hover:text-red-600"
          aria-label="ログを削除"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-3 mb-2">
        <div className="flex flex-col items-center w-1/3">
          <img
            src={getPokemonIconPath(attackerDetails.pokemonId)}
            alt={attackerDetails.pokemonName}
            className="w-16 h-16 mb-1 border border-gray-700 rounded"
          />
          <p className="text-xs text-center truncate w-full" title={attackerDetails.pokemonName}>{attackerDetails.pokemonName}</p>
          {attackerDetails.item && <p className="text-[10px] text-gray-400 text-center truncate w-full" title={attackerDetails.item}>持: {attackerDetails.item}</p>}
          {attackerDetails.ability && <p className="text-[10px] text-gray-400 text-center truncate w-full" title={attackerDetails.ability}>特: {attackerDetails.ability}</p>}
        </div>

        <div className="flex-grow text-center">
            <p className="font-semibold text-sm">
                {attackerMoveName}
                {hitCount > 1 && <span className="text-xs"> ({hitCount}回)</span>}
            </p>
            <p className="text-lg font-bold my-1">
                <span className={getDamageColorHistory(minPercentageDisplay)}>{minDamageDisplay}</span>
                {' ~ '}
                <span className={getDamageColorHistory(maxPercentageDisplay)}>{maxDamageDisplay}</span>
            </p>
            <p className="text-xs text-gray-300">
                ({formatPercentageHistory(minPercentageDisplay)}% ~ {formatPercentageHistory(maxPercentageDisplay)}%)
            </p>
            <p className="text-xs font-semibold mt-1">{koTextDisplay}</p>
        </div>

        <div className="flex flex-col items-center w-1/3">
          <img
            src={getPokemonIconPath(defenderDetails.pokemonId)}
            alt={defenderDetails.pokemonName}
            className="w-16 h-16 mb-1 border border-gray-700 rounded"
          />
          <p className="text-xs text-center truncate w-full" title={defenderDetails.pokemonName}>{defenderDetails.pokemonName}</p>
          {defenderDetails.item && <p className="text-[10px] text-gray-400 text-center truncate w-full" title={defenderDetails.item}>持: {defenderDetails.item}</p>}
          {defenderDetails.ability && <p className="text-[10px] text-gray-400 text-center truncate w-full" title={defenderDetails.ability}>特: {defenderDetails.ability}</p>}
        </div>
      </div>
      
      <div className="w-full h-3 bg-white rounded-full overflow-hidden mb-1">
        <div className="h-full relative">
          {actualRemainingHPMinPercentageInLog > 0 && (
            <div
              className={`absolute top-0 left-0 h-full ${getHpBarColorByRemainingHp(actualRemainingHPMinPercentageInLog)}`}
              style={{ width: `${actualRemainingHPMinPercentageInLog}%` }}
            />
          )}
          {actualRemainingHPMaxPercentageInLog > actualRemainingHPMinPercentageInLog && (
            <div
              className={`absolute top-0 h-full ${getHpRangeBarColorByRemainingHp(actualRemainingHPMinPercentageInLog)}`}
              style={{
                left: `${actualRemainingHPMinPercentageInLog}%`,
                width: `${Math.max(0, actualRemainingHPMaxPercentageInLog - actualRemainingHPMinPercentageInLog)}%`,
              }}
            />
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>残りHP (最大HP: {defenderOriginalHP})</span>
      </div>

      <div className="mt-2 flex items-center justify-center space-x-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-blue-400 hover:underline flex items-center"
        >
          <Info size={16} className="mr-1"/> 詳細を見る
        </button>
        <button
          onClick={handleLoadClick}
          className="text-sm text-green-400 hover:underline flex items-center disabled:text-gray-500 disabled:no-underline"
          disabled={!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot}
          title={(!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot) ? "古い形式のログは復元できません" : "この計算を復元"}
        >
          <RotateCcw size={16} className="mr-1"/> この計算をロード
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white text-center flex-grow">計算ログ詳細</h2>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="閉じる"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>

            <div className="mb-2">
              <p>攻：{attackerPokemonName}:{attackerMoveName} {hitCount > 1 && `${hitCount}回`}</p>
              <p>防：{defenderPokemonName} (HP: {defenderOriginalHP})</p>
            </div>
            <div className="mb-2">
              <p className="text-sm text-gray-400 mb-1">通常{hitCount > 1 && ` (${hitCount}回)`}</p>
              <p className="text-white font-medium">
                <span className={getDamageColorHistory(result.minPercentage)}>{result.minDamage * displayHitCount}</span>
                {' - '}
                <span className={getDamageColorHistory(result.maxPercentage)}>{result.maxDamage * displayHitCount}</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formatPercentageHistory(result.minPercentage)}% - {formatPercentageHistory(result.maxPercentage)}%)
                  {' '}{getKOTextHistory(result.normalDamages, defenderOriginalHP, hitCount, calculateKOChanceForHistory, isVariablePowerMove)}
                </span>
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-red-400 mb-1">急所{hitCount > 1 && ` (${hitCount}回)`}</p>
              <p className="text-white font-medium">
                <span className={getDamageColorHistory(result.critMinPercentage)}>{result.critMinDamage * displayHitCount}</span>
                {' - '}
                <span className={getDamageColorHistory(result.critMaxPercentage)}>{result.critMaxDamage * displayHitCount}</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({formatPercentageHistory(result.critMinPercentage)}% - {formatPercentageHistory(result.critMaxPercentage)}%)
                  {' '}{getKOTextHistory(result.criticalDamages, defenderOriginalHP, hitCount, calculateKOChanceForHistory, isVariablePowerMove)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-red-400 mb-3 border-b border-gray-700 pb-1">攻撃側: {attackerDetails.pokemonName}</h3>
                <div className="flex items-start mb-2">
                    <img 
                      src={getPokemonIconPath(attackerDetails.pokemonId)} 
                      alt={attackerDetails.pokemonName} 
                      className="w-12 h-12 inline-block mr-2 border border-gray-700 rounded" 
                    />
                    <div className="flex flex-col space-y-1">
                        {Array.isArray(attackerDetails.displayTypes) && attackerDetails.displayTypes.map((type, idx) => (
                            type && <span 
                                key={`log-attacker-type-${idx}`}
                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: getTypeColorFromHistory(type as PokemonType | 'stellar') }}
                            >
                                {getTypeNameJpFromHistory(type as PokemonType | 'stellar')}
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>技の威力: <span className="font-semibold text-white">{attackerDetails.movePower}</span></li>
                  {attackerDetails.moveCategory && (
                    <li>技カテゴリ: <span className="font-semibold text-white">
                        {attackerDetails.moveCategory === 'physical' ? '物理' : attackerDetails.moveCategory === 'special' ? '特殊' : '変化'}
                    </span></li>
                  )}
                  <li>攻撃/特攻の値: <span className="font-semibold text-white">{attackerDetails.offensiveStatValue}</span></li>
                  <li>攻撃/特攻ランク: <span className="font-semibold text-white">{attackerDetails.offensiveStatRank >= 0 ? `+${attackerDetails.offensiveStatRank}` : attackerDetails.offensiveStatRank}</span></li>
                  {attackerDetails.teraType && !attackerDetails.isStellar && <li>テラスタル: <span className="font-semibold text-white">{getTypeNameJpFromHistory(attackerDetails.teraType)}</span></li>}
                  {attackerDetails.isStellar && <li>テラスタル: <span className="font-semibold text-pink-400">{getTypeNameJpFromHistory('stellar')}</span></li>}
                  {attackerDetails.item && <li>持ち物: <span className="font-semibold text-white">{attackerDetails.item}</span></li>}
                  {attackerDetails.ability && <li>特性: <span className="font-semibold text-white">{attackerDetails.ability}</span></li>}
                  {attackerDetails.isBurned && <li className="text-red-400 font-semibold">火傷状態</li>}
                  {attackerDetails.hasHelpingHand && <li className="text-green-400 font-semibold">てだすけ</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-3 border-b border-gray-700 pb-1">防御側: {defenderDetails.pokemonName}</h3>
                 <div className="flex items-start mb-2">
                    <img 
                        src={getPokemonIconPath(defenderDetails.pokemonId)} 
                        alt={defenderDetails.pokemonName} 
                        className="w-12 h-12 inline-block mr-2 border border-gray-700 rounded"
                    />
                    <div className="flex flex-col space-y-1">
                        {Array.isArray(defenderDetails.displayTypes) && defenderDetails.displayTypes.map((type, idx) => (
                            type && <span 
                                key={`log-defender-type-${idx}`}
                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: getTypeColorFromHistory(type) }}
                            >
                                {getTypeNameJpFromHistory(type)}
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  {defenderDetails.maxHp && <li>最大HP: <span className="font-semibold text-white">{defenderDetails.maxHp}</span></li>}
                  <li>防御/特防の値: <span className="font-semibold text-white">{defenderDetails.defensiveStatValue}</span></li>
                  <li>防御/特防ランク: <span className="font-semibold text-white">{defenderDetails.defensiveStatRank >= 0 ? `+${defenderDetails.defensiveStatRank}` : defenderDetails.defensiveStatRank}</span></li>
                  <li>相性: <span className="font-semibold text-white">×{result.effectiveness.toFixed(2)}</span></li>
                  {defenderDetails.item && <li>持ち物: <span className="font-semibold text-white">{defenderDetails.item}</span></li>}
                  {defenderDetails.ability && <li>特性: <span className="font-semibold text-white">{defenderDetails.ability}</span></li>}
                  {defenderDetails.hasReflect && <li className="text-blue-300 font-semibold">リフレクター</li>}
                  {defenderDetails.hasLightScreen && <li className="text-yellow-300 font-semibold">ひかりのかべ</li>}
                  {defenderDetails.hasFriendGuard && <li className="text-purple-300 font-semibold">フレンドガード</li>}
                </ul>
              </div>
            </div>
            
            {(globalStatesSnapshot?.weather || globalStatesSnapshot?.field || (globalStatesSnapshot?.disasters && Object.values(globalStatesSnapshot.disasters).some(d => d))) && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium text-indigo-400 mb-3">フィールド状態</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  {globalStatesSnapshot?.weather && globalStatesSnapshot.weather !== 'none' && <li>天候: <span className="font-semibold text-white">{WEATHER_NAME_JP_HISTORY[globalStatesSnapshot.weather as keyof typeof WEATHER_NAME_JP_HISTORY] || globalStatesSnapshot.weather}</span></li>}
                  {globalStatesSnapshot?.field && globalStatesSnapshot.field !== 'none' && <li>フィールド: <span className="font-semibold text-white">{FIELD_NAME_JP_HISTORY[globalStatesSnapshot.field as keyof typeof FIELD_NAME_JP_HISTORY] || globalStatesSnapshot.field}</span></li>}
                  {globalStatesSnapshot?.disasters && Object.entries(globalStatesSnapshot.disasters).map(([key, value]) => 
                    value && <li key={key}>災い: <span className="font-semibold text-red-400">{DISASTER_MAP_HISTORY[key as keyof DisasterState]}</span></li>
                  )}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium text-sm mb-2">通常ダメージ分布{hitCount > 1 && ` (技1回あたり)`}</h4>
              <div className="grid grid-cols-8 gap-[2px] text-[10px]">
                {result.normalDamages.map((damageValue, i) => {
                  const factor = 0.85 + i * 0.01;
                  const totalDamage = isVariablePowerMove ? damageValue : (damageValue * hitCount);
                  const percentage = defenderOriginalHP > 0 ? (totalDamage / defenderOriginalHP) * 100 : 0;
                  return (
                    <div
                      key={`log-normal-dist-${i}`}
                      className="bg-gray-700 p-[2px] rounded text-center leading-tight"
                    >
                      <div className="text-gray-400">×{factor.toFixed(2)}</div>
                      <div className={getDamageColorHistory(percentage)}>{totalDamage}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-red-400 font-medium text-sm mb-2">急所ダメージ分布{hitCount > 1 && ` (技1回あたり)`}</h4>
              <div className="grid grid-cols-8 gap-[2px] text-[10px]">
                {result.criticalDamages.map((damageValue, i) => {
                   const factor = 0.85 + i * 0.01;
                   const totalDamage = isVariablePowerMove ? damageValue : (damageValue * hitCount);
                  const percentage = defenderOriginalHP > 0 ? (totalDamage / defenderOriginalHP) * 100 : 0;
                  return (
                    <div
                      key={`log-crit-dist-${i}`}
                      className="bg-gray-700 p-[2px] rounded text-center leading-tight"
                    >
                      <div className="text-gray-400">×{factor.toFixed(2)}</div>
                      <div className={getDamageColorHistory(percentage)}>{totalDamage}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
                <button
                    onClick={handleLoadClick}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center disabled:bg-gray-500"
                    disabled={!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot}
                    title={(!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot) ? "古い形式のログは復元できません" : "この計算を復元"}
                >
                    <RotateCcw size={16} className="mr-2"/> この計算をロード
                </button>
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    閉じる
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogCard;