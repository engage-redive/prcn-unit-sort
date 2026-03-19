import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  DamageCalculation,
  PokemonType,
  Weather,
  Field,
  DisasterState,
  AttackerDetailsForModal,
  DefenderDetailsForModal,
} from '../types';
import { useGlobalStateStore } from '../stores/globalStateStore';
import { useAttackerStore } from '../stores/attackerStore';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { getPokemonIconPath } from '../utils/uiHelpers';

interface DamageResultProps {
  attackerIndex: number;
  result: DamageCalculation | null;
  defenderHP: number;
  combinedResult?: {
    minDamage: number;
    maxDamage: number;
    minPercentage: number;
    maxPercentage: number;
  };
  attackerPokemonName?: string;
  attackerMoveName?: string;
  attackerMoveNameForDisplay?: string;
  defenderPokemonName?: string;
  hitCount?: number;
  attackerDetails?: AttackerDetailsForModal;
  defenderDetails?: DefenderDetailsForModal | null;
  weather?: Weather | null;
  field?: Field | null;
  disasters?: DisasterState;
  resultIdSuffix: string;
  onSaveLog?: () => void;
  showIndividualAttackResults: boolean;
  onToggleShowIndividualAttackResults: () => void;
  isVariablePowerMove?: boolean;
}

const TYPE_NAME_JP_MODAL: Record<string, string> = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき', grass: 'くさ', ice: 'こおり',
  fighting: 'かくとう', poison: 'どく', ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく', steel: 'はがね', fairy: 'フェアリー',
  stellar: 'ステラ',
};

const TYPE_COLORS_MODAL: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
  stellar: '#7A7AE6',
};

const WEATHER_NAME_JP: Record<string, string> = {
  'none': 'なし', 'sun': 'はれ', 'rain': 'あめ', 'sandstorm': 'すなあらし', 'snow': 'ゆき',
  'harsh_sunlight': 'おおひでり', 'heavy_rain': 'おおあめ',
};

const FIELD_NAME_JP: Record<string, string> = {
  'none': 'なし', 'electric': 'エレキフィールド', 'grassy': 'グラスフィールド',
  'psychic': 'サイコフィールド', 'misty': 'ミストフィールド',
};

const disasterMap: Record<keyof DisasterState, string> = {
  sword: "わざわいのつるぎ", ball: "わざわいのたま", vessel: "わざわいのうつわ", talisman: "わざわいのおふだ"
};

const formatPercentage = (percentage: number): string => {
  const fixed = Math.max(0, percentage).toFixed(2);
  if (fixed === '100.00' && percentage < 100) return '99.99';
  if (fixed === '0.00' && percentage > 0) return '0.01';
  return fixed;
};

// --- ダメージ乱数確定分布ロジック ---
const getExactMultiHitDistribution = (singleHitDamages: number[], hitCount: number): Map<number, number> => {
  let distribution = new Map<number, number>();
  if (!singleHitDamages || singleHitDamages.length === 0) return distribution;
  for (const d of singleHitDamages) {
    distribution.set(d, (distribution.get(d) || 0) + 1 / singleHitDamages.length);
  }
  for (let i = 1; i < hitCount; i++) {
    const nextDist = new Map<number, number>();
    for (const [currentDmg, currentProb] of distribution.entries()) {
      for (const d of singleHitDamages) {
        const newDmg = currentDmg + d;
        const newProb = currentProb * (1 / singleHitDamages.length);
        nextDist.set(newDmg, (nextDist.get(newDmg) || 0) + newProb);
      }
    }
    distribution = nextDist;
  }
  return distribution;
};

const DamageResult: React.FC<DamageResultProps> = ({
  attackerIndex, result, defenderHP, combinedResult, attackerPokemonName, attackerMoveName,
  attackerMoveNameForDisplay, defenderPokemonName, hitCount = 1, attackerDetails,
  defenderDetails, weather, field, disasters, resultIdSuffix, onSaveLog,
  showIndividualAttackResults, onToggleShowIndividualAttackResults,
  isVariablePowerMove = false,
}) => {
  const { isDoubleBattle, setIsDoubleBattle } = useGlobalStateStore();
  const { attackers, setIsCritical } = useAttackerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  const isCriticalModeActive = !!attackers[attackerIndex]?.isCritical;

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = originalOverflow;
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isModalOpen]);

  const { normalDistMap, criticalDistMap, minMax } = useMemo(() => {
    if (!result) return { normalDistMap: new Map<number, number>(), criticalDistMap: new Map<number, number>(), minMax: null };
    const effectiveHitCount = (isVariablePowerMove || result.isMultiHitCombined) ? 1 : hitCount;
    const nDist = getExactMultiHitDistribution(result.normalDamages, effectiveHitCount);
    const cDist = getExactMultiHitDistribution(result.criticalDamages, effectiveHitCount);
    const nDmgs = Array.from(nDist.keys());
    const cDmgs = Array.from(cDist.keys());
    return {
      normalDistMap: nDist, criticalDistMap: cDist,
      minMax: {
        nMin: Math.min(...nDmgs), nMax: Math.max(...nDmgs),
        cMin: Math.min(...cDmgs), cMax: Math.max(...cDmgs),
      }
    };
  }, [result, hitCount, isVariablePowerMove]);

  if (!result || !minMax) return <div className="p-2 bg-gray-800 rounded-lg text-center text-gray-400">計算結果なし</div>;

  const multiHitMinDamage = isCriticalModeActive ? minMax.cMin : minMax.nMin;
  const multiHitMaxDamage = isCriticalModeActive ? minMax.cMax : minMax.nMax;
  const minPercentage = (multiHitMinDamage / defenderHP) * 100;
  const maxPercentage = (multiHitMaxDamage / defenderHP) * 100;

  const getKOInfo = (distMap: Map<number, number>, hp: number) => {
    const sorted = Array.from(distMap.keys()).sort((a, b) => a - b);
    const minD = sorted[0], maxD = sorted[sorted.length - 1];
    if (maxD <= 0) return "ダメージなし";
    const minHits = Math.ceil(hp / maxD), maxHits = minD > 0 ? Math.ceil(hp / minD) : Infinity;
    if (minHits > 9) return minHits === maxHits ? `確定${minHits}発` : `複数${minHits}発`;
    if (minHits === maxHits) return `確定${minHits}発`;
    let currentProbDist = distMap;
    for (let i = 1; i < minHits; i++) {
      const nextDist = new Map<number, number>();
      for (const [d1, p1] of currentProbDist.entries()) {
        if (d1 >= hp) { nextDist.set(d1, (nextDist.get(d1) || 0) + p1); continue; }
        for (const [d2, p2] of distMap.entries()) {
          const newD = d1 + d2;
          nextDist.set(newD, (nextDist.get(newD) || 0) + p1 * p2);
        }
      }
      currentProbDist = nextDist;
    }
    let koProb = 0;
    for (const [dmg, prob] of currentProbDist.entries()) { if (dmg >= hp) koProb += prob; }
    const pPercent = koProb * 100;
    if (pPercent >= 99.999) return `確定${minHits}発`;
    return `乱数${minHits}発 (${formatPercentage(pPercent)}%)`;
  };

  const getDamageColor = (p: number) => p >= 100 ? 'text-red-500' : p >= 50 ? 'text-yellow-500' : 'text-white';
  const getTypeNameJp = (type: PokemonType | string | undefined) => type ? (TYPE_NAME_JP_MODAL[type.toLowerCase()] || type) : '';
  const getTypeColor = (type: PokemonType | string | undefined) => type ? (TYPE_COLORS_MODAL[type.toLowerCase()] || '#777777') : '#777777';

  const ModalComponent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white text-center flex-grow">ダメージ計算詳細</h2>
          <button className="text-gray-400 hover:text-white" onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <div className="mb-4 text-sm space-y-1 text-gray-300 border-b border-gray-700 pb-2">
          <p>攻: <span className="text-white font-medium">{attackerPokemonName}</span> / {attackerMoveNameForDisplay || attackerMoveName} {!isVariablePowerMove && hitCount > 1 && `(${hitCount}回)`}</p>
          <p>防: <span className="text-white font-medium">{defenderPokemonName}</span> (HP: {defenderHP})</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3 bg-gray-900 rounded border-l-4 border-gray-400">
            <p className="text-xs text-gray-400 mb-1">通常</p>
            <p className="font-bold text-white text-lg">
              {minMax.nMin} - {minMax.nMax}
              <span className="text-sm ml-2 text-gray-400">({formatPercentage((minMax.nMin / defenderHP) * 100)}% - {formatPercentage((minMax.nMax / defenderHP) * 100)}%)</span>
              <span className="ml-2 text-blue-300 text-sm font-medium">{getKOInfo(normalDistMap, defenderHP)}</span>
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border-l-4 border-red-500">
            <p className="text-xs text-red-400 mb-1">急所</p>
            <p className="font-bold text-white text-lg">
              {minMax.cMin} - {minMax.cMax}
              <span className="text-sm ml-2 text-gray-400">({formatPercentage((minMax.cMin / defenderHP) * 100)}% - {formatPercentage((minMax.cMax / defenderHP) * 100)}%)</span>
              <span className="ml-2 text-red-300 text-sm font-medium">{getKOInfo(criticalDistMap, defenderHP)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm mb-6 border-b border-gray-700 pb-4">
          <div>
            <h3 className="font-bold text-red-400 mb-2 flex items-center">
              {attackerDetails && <img src={getPokemonIconPath(attackerDetails.pokemonId)} className="w-8 h-8 mr-2" alt="" />}
              攻撃側: {attackerPokemonName}
            </h3>
            <div className="flex gap-1 mb-2">
              {attackerDetails?.displayTypes?.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: getTypeColor(t) }}>{getTypeNameJp(t)}</span>
              ))}
            </div>
            <ul className="space-y-1 text-gray-300 text-xs">
              <li>技の威力: <span className="text-white">{attackerDetails?.movePower}</span></li>
              <li>技カテゴリ: <span className="text-white">{attackerDetails?.moveCategory === 'physical' ? '物理' : '特殊'}</span></li>
              <li>攻撃/特攻: <span className="text-white">{attackerDetails?.offensiveStatValue}</span> (ランク:{attackerDetails?.offensiveStatRank})</li>
              <li>特性: <span className="text-white">{attackerDetails?.ability || 'なし'}</span></li>
              <li>持ち物: <span className="text-white">{attackerDetails?.item || 'なし'}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-blue-400 mb-2 flex items-center">
              {defenderDetails && <img src={getPokemonIconPath(defenderDetails.pokemonId)} className="w-8 h-8 mr-2" alt="" />}
              防御側: {defenderPokemonName}
            </h3>
            <div className="flex gap-1 mb-2">
              {defenderDetails?.displayTypes?.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: getTypeColor(t) }}>{getTypeNameJp(t)}</span>
              ))}
            </div>
            <ul className="space-y-1 text-gray-300 text-xs">
              <li>防御/特防: <span className="text-white">{defenderDetails?.defensiveStatValue}</span> (ランク:{defenderDetails?.defensiveStatRank})</li>
              <li>相性: <span className="text-white font-bold">{result.effectiveness}</span></li>
              {defenderDetails?.hasReflect && <li className="text-blue-300">リフレクター</li>}
              {defenderDetails?.hasLightScreen && <li className="text-yellow-300">ひかりのかべ</li>}
              <li>特性: <span className="text-white">{defenderDetails?.ability || 'なし'}</span></li>
              <li>持ち物: <span className="text-white">{defenderDetails?.item || 'なし'}</span></li>
            </ul>
          </div>
        </div>

        {/* 16乱数ダメージ分布 */}
        <div className="mb-4">
          <h4 className="text-white font-medium text-xs mb-2">各ダメージ分布 (1ヒットあたり)</h4>
          <div className="grid grid-cols-8 gap-1 text-[10px]">
            {result.normalDamages.map((dmg, i) => (
              <div key={i} className="bg-gray-700 p-1 rounded text-center">
                <div className="text-gray-400">{(0.85 + i * 0.01).toFixed(2)}</div>
                <div className="text-white">{dmg}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={result.parentalBondChild ? "mb-4" : "mb-6"}>
          <h4 className="text-red-400 font-medium text-xs mb-2">各ダメージ分布 (1ヒットあたり・急所)</h4>
          <div className="grid grid-cols-8 gap-1 text-[10px]">
            {result.criticalDamages.map((dmg, i) => (
              <div key={i} className="bg-gray-700 p-1 rounded text-center">
                <div className="text-gray-400">{(0.85 + i * 0.01).toFixed(2)}</div>
                <div className="text-red-400">{dmg}</div>
              </div>
            ))}
          </div>
        </div>

        {result.parentalBondChild && (
          <>
            <div className="mb-4">
              <h4 className="text-white font-medium text-xs mb-2">各ダメージ分布 (1ヒットあたり・おやこあい子)</h4>
              <div className="grid grid-cols-8 gap-1 text-[10px]">
                {result.parentalBondChild.normalDamages.map((dmg, i) => (
                  <div key={i} className="bg-gray-700 p-1 rounded text-center">
                    <div className="text-gray-400">{(0.85 + i * 0.01).toFixed(2)}</div>
                    <div className="text-white">{dmg}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-red-400 font-medium text-xs mb-2">各ダメージ分布 (1ヒットあたり・急所・おやこあい子)</h4>
              <div className="grid grid-cols-8 gap-1 text-[10px]">
                {result.parentalBondChild.criticalDamages.map((dmg, i) => (
                  <div key={i} className="bg-gray-700 p-1 rounded text-center">
                    <div className="text-gray-400">{(0.85 + i * 0.01).toFixed(2)}</div>
                    <div className="text-red-400">{dmg}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* フィールド情報 */}
        {(() => {
          const hasFieldInfo = (weather && weather !== 'none') || (field && field !== 'none') || (disasters && Object.values(disasters).some(v => v));
          return hasFieldInfo && (
            <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-300 mb-6">
              <h4 className="font-bold text-indigo-400 mb-1">フィールド情報</h4>
              <div className="grid grid-cols-2 gap-x-4">
                {weather && weather !== 'none' && <p>天気: {WEATHER_NAME_JP[weather] || weather}</p>}
                {field && field !== 'none' && <p>場所: {FIELD_NAME_JP[field] || field}</p>}
                {disasters && Object.entries(disasters).map(([k, v]) => v && (
                  <p key={k} className="text-red-400">災: {disasterMap[k as keyof DisasterState]}</p>
                ))}
              </div>
            </div>
          );
        })()}

        <button onClick={() => setIsModalOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded font-bold text-white transition-colors">閉じる</button>
      </div>
    </div>
  );

  return (
    <div className="p-1 bg-gray-800 rounded-lg" id={`result-${resultIdSuffix}`}>
      {combinedResult && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-white">合計ダメージ</p>
            <button onClick={onToggleShowIndividualAttackResults} className="text-gray-400 p-1">
              {showIndividualAttackResults ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          <p className="text-white font-medium mb-1 text-sm">
            <span className={getDamageColor(combinedResult.minPercentage)}>{combinedResult.minDamage}</span> - <span className={getDamageColor(combinedResult.maxPercentage)}>{combinedResult.maxDamage}</span>
            <span className="text-xs text-gray-400 ml-1">({formatPercentage(combinedResult.minPercentage)}% - {formatPercentage(combinedResult.maxPercentage)}%)</span>
          </p>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full relative">
              <div className="absolute h-full bg-green-500" style={{ width: `${Math.max(0, 100 - combinedResult.maxPercentage)}%` }} />
              <div className="absolute h-full bg-yellow-600 opacity-50" style={{ left: `${100 - combinedResult.maxPercentage}%`, width: `${combinedResult.maxPercentage - combinedResult.minPercentage}%` }} />
            </div>
          </div>
        </div>
      )}

      {showIndividualAttackResults && (
        <div className={combinedResult ? 'border-t border-gray-700 mt-2 pt-2' : ''}>
          {result.parentalBondParent && result.parentalBondChild ? (
            // おやこあい：親・子・合計の3行表示
            (() => {
              const parent = isCriticalModeActive ? result.parentalBondParent.criticalDamages : result.parentalBondParent.normalDamages;
              const child = isCriticalModeActive ? result.parentalBondChild.criticalDamages : result.parentalBondChild.normalDamages;
              const parentMin = Math.min(...parent);
              const parentMax = Math.max(...parent);
              const childMin = Math.min(...child);
              const childMax = Math.max(...child);
              const totalMin = parentMin + childMin;
              const totalMax = parentMax + childMax;
              const totalMinPct = (totalMin / defenderHP) * 100;
              const totalMaxPct = (totalMax / defenderHP) * 100;
              const parentMinPct = (parentMin / defenderHP) * 100;
              const parentMaxPct = (parentMax / defenderHP) * 100;
              const childMinPct = (childMin / defenderHP) * 100;
              const childMaxPct = (childMax / defenderHP) * 100;

              // 合計でのKO情報
              const totalDist = new Map<number, number>();
              for (const p of parent) {
                for (const c of child) {
                  const t = p + c;
                  totalDist.set(t, (totalDist.get(t) || 0) + 1);
                }
              }

              return (
                <div className="space-y-1.5">
                  {/* 合計ダメージバー */}
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-1.5 relative">
                    <div className={`absolute h-full ${Math.max(0, 100 - totalMaxPct) <= 25 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.max(0, 100 - totalMaxPct)}%` }} />
                    <div className="absolute h-full bg-yellow-700 opacity-60" style={{ left: `${Math.max(0, 100 - totalMaxPct)}%`, width: `${totalMaxPct - totalMinPct}%` }} />
                  </div>
                  {/* 合計 */}
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className={`text-[11px] mb-0.5 ${isCriticalModeActive ? 'text-red-400' : 'text-purple-300'}`}>
                        おやこあい合計 {isCriticalModeActive ? '(急所)' : ''}
                        <span className="ml-2 font-semibold text-white">{getKOInfo(totalDist, defenderHP)}</span>
                      </p>
                      <p className="text-sm font-bold text-white leading-none">
                        <span className={getDamageColor(totalMinPct)}>{totalMin}</span> - <span className={getDamageColor(totalMaxPct)}>{totalMax}</span>
                        <span className="text-xs font-normal ml-2 text-gray-300">({formatPercentage(totalMinPct)}% - {formatPercentage(totalMaxPct)}%)</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5 ml-2">
                      <label className="flex items-center text-[11px] text-gray-400 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={isDoubleBattle} onChange={(e) => setIsDoubleBattle(e.target.checked)} className="mr-1 w-3 h-3" />
                        ダブル
                      </label>
                      <label className="flex items-center text-[11px] text-gray-400 cursor-pointer hover:text-white">
                        <input type="checkbox" checked={isCriticalModeActive} onChange={(e) => setIsCritical(attackerIndex, e.target.checked)} className="mr-1 w-3 h-3" />
                        急所
                      </label>
                      <button onClick={() => { if (onSaveLog) onSaveLog(); setIsModalOpen(true); }} className="text-[11px] text-blue-400 hover:underline px-1 py-0.5 bg-gray-700 rounded border border-gray-600">詳細</button>
                    </div>
                  </div>
                  {/* 親ヒット */}
                  <div className="border-t border-gray-700/50 pt-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">親（×1.0）</p>
                    <p className="text-xs text-white">
                      <span className={getDamageColor(parentMinPct)}>{parentMin}</span> - <span className={getDamageColor(parentMaxPct)}>{parentMax}</span>
                      <span className="text-[10px] text-gray-400 ml-1">({formatPercentage(parentMinPct)}% - {formatPercentage(parentMaxPct)}%)</span>
                    </p>
                  </div>
                  {/* 子ヒット */}
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">子（×0.25）</p>
                    <p className="text-xs text-white">
                      <span className={getDamageColor(childMinPct)}>{childMin}</span> - <span className={getDamageColor(childMaxPct)}>{childMax}</span>
                      <span className="text-[10px] text-gray-400 ml-1">({formatPercentage(childMinPct)}% - {formatPercentage(childMaxPct)}%)</span>
                    </p>
                  </div>
                </div>
              );
            })()
          ) : (
            // 通常表示
            <>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-1.5 relative">
                <div className={`absolute h-full ${Math.max(0, 100 - maxPercentage) <= 25 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.max(0, 100 - maxPercentage)}%` }} />
                <div className="absolute h-full bg-yellow-700 opacity-60" style={{ left: `${Math.max(0, 100 - maxPercentage)}%`, width: `${maxPercentage - minPercentage}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <p className={`text-[11px] mb-0.5 ${isCriticalModeActive ? 'text-red-400' : 'text-gray-300'}`}>
                    {isCriticalModeActive ? '急所' : '通常'} {!isVariablePowerMove && hitCount > 1 && `(${hitCount}回)`}
                    <span className="ml-2 font-semibold text-white">{getKOInfo(isCriticalModeActive ? criticalDistMap : normalDistMap, defenderHP)}</span>
                  </p>
                  <p className="text-sm font-bold text-white leading-none">
                    <span className={getDamageColor(minPercentage)}>{multiHitMinDamage}</span> - <span className={getDamageColor(maxPercentage)}>{multiHitMaxDamage}</span>
                    <span className="text-xs font-normal ml-2 text-gray-300">({formatPercentage(minPercentage)}% - {formatPercentage(maxPercentage)}%)</span>
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 ml-2">
                  <label className="flex items-center text-[11px] text-gray-400 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={isDoubleBattle} onChange={(e) => setIsDoubleBattle(e.target.checked)} className="mr-1 w-3 h-3" />
                    ダブル
                  </label>
                  <label className="flex items-center text-[11px] text-gray-400 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={isCriticalModeActive} onChange={(e) => setIsCritical(attackerIndex, e.target.checked)} className="mr-1 w-3 h-3" />
                    急所
                  </label>
                  <button onClick={() => { if (onSaveLog) onSaveLog(); setIsModalOpen(true); }} className="text-[11px] text-blue-400 hover:underline px-1 py-0.5 bg-gray-700 rounded border border-gray-600">詳細</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isModalOpen && modalRoot && ReactDOM.createPortal(ModalComponent, modalRoot)}
    </div>
  );
};

export default DamageResult;