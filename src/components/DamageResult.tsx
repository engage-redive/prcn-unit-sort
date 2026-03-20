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
import { X, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { getPokemonIconPath } from '../utils/uiHelpers';
import { items } from '../data/items';

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

const getItemIdFromName = (itemName: string): string | null => {
  const item = items.find(i => i.name === itemName);
  return item ? item.id : null;
};

const renderItemIcon = (itemName: string | null) => {
  if (!itemName) return null;
  const itemId = getItemIdFromName(itemName);
  if (!itemId) return null;
  return (
    <img 
      src={`/itemsIcon/${itemId}.png`} 
      alt={itemName} 
      className="w-4 h-4 shrink-0 object-contain drop-shadow-sm" 
      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
    />
  );
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
    let nDist = getExactMultiHitDistribution(result.normalDamages, effectiveHitCount);
    let cDist = getExactMultiHitDistribution(result.criticalDamages, effectiveHitCount);

    if (result.parentalBondChild) {
      const childNDist = getExactMultiHitDistribution(result.parentalBondChild.normalDamages, 1);
      
      const combinedNDist = new Map<number, number>();
      for (const [d1, p1] of nDist.entries()) {
        for (const [d2, p2] of childNDist.entries()) {
          const totalD = d1 + d2;
          combinedNDist.set(totalD, (combinedNDist.get(totalD) || 0) + p1 * p2);
        }
      }
      nDist = combinedNDist;

      const combinedCDist = new Map<number, number>();
      for (const [d1, p1] of cDist.entries()) {
        for (const [d2, p2] of childNDist.entries()) {
          const totalD = d1 + d2;
          combinedCDist.set(totalD, (combinedCDist.get(totalD) || 0) + p1 * p2);
        }
      }
      cDist = combinedCDist;
    }

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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1000] flex items-center justify-center p-3 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg px-5 py-4 flex justify-between items-center border-b border-slate-800 z-30 shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Info size={20} className="mr-2 text-blue-400" />
              ダメージ計算詳細
            </h2>
            <button
              className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full"
              onClick={() => setIsModalOpen(false)}
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200 flex items-center">
                  <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 font-bold text-[11px] flex items-center justify-center mr-2 shrink-0">攻</span>
                  {attackerDetails && <img src={getPokemonIconPath(attackerDetails.pokemonId)} alt="" className="w-6 h-6 mr-1.5 shrink-0" />}
                  {attackerPokemonName} → {attackerMoveNameForDisplay || attackerMoveName}
                  {!isVariablePowerMove && hitCount > 1 && <span className="text-slate-400 ml-1 text-xs">({hitCount}回)</span>}
                </p>
                <p className="text-sm font-medium text-slate-200 flex items-center">
                  <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 font-bold text-[11px] flex items-center justify-center mr-2 shrink-0">防</span>
                  {defenderDetails && <img src={getPokemonIconPath(defenderDetails.pokemonId)} alt="" className="w-6 h-6 mr-1.5 shrink-0" />}
                  {defenderPokemonName}
                  <span className="text-slate-400 ml-1.5 text-xs">(HP: {defenderHP})</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {isDoubleBattle && <span className="px-2 py-0.5 text-[10px] bg-blue-500/80 text-white rounded font-medium border border-blue-400/50">ダブル</span>}
                {isCriticalModeActive && <span className="px-2 py-0.5 text-[10px] bg-red-500/80 text-white rounded font-medium border border-red-400/50">急所モード</span>}
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-900 rounded border-l-4 border-gray-400">
                {result.parentalBondChild ? (
                  <p className="text-xs text-blue-300 mb-1 font-bold">
                    おやこあい合計 <span className="ml-1 text-sm">{getKOInfo(normalDistMap, defenderHP)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mb-1">通常</p>
                )}
                <p className="font-bold text-white text-lg">
                  {minMax.nMin} - {minMax.nMax}
                  <span className="text-sm ml-2 text-gray-400">({formatPercentage((minMax.nMin / defenderHP) * 100)}% - {formatPercentage((minMax.nMax / defenderHP) * 100)}%)</span>
                  {!result.parentalBondChild && <span className="ml-2 text-blue-300 text-sm font-medium">{getKOInfo(normalDistMap, defenderHP)}</span>}
                </p>
              </div>
              <div className="p-3 bg-gray-900 rounded border-l-4 border-red-500">
                {result.parentalBondChild ? (
                  <p className="text-xs text-red-400 mb-1 font-bold">
                    おやこあい合計 <span className="ml-1 text-sm">{getKOInfo(criticalDistMap, defenderHP)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-400 mb-1">急所</p>
                )}
                <p className="font-bold text-white text-lg">
                  {minMax.cMin} - {minMax.cMax}
                  <span className="text-sm ml-2 text-gray-400">({formatPercentage((minMax.cMin / defenderHP) * 100)}% - {formatPercentage((minMax.cMax / defenderHP) * 100)}%)</span>
                  {!result.parentalBondChild && <span className="ml-2 text-red-300 text-sm font-medium">{getKOInfo(criticalDistMap, defenderHP)}</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-sm font-bold text-red-400 mb-3 border-b border-slate-700/50 pb-2 flex items-center">
                    <span className="w-1.5 h-5 bg-red-500 rounded-sm mr-2 inline-block"></span>
                    攻撃側: {attackerPokemonName}
                </h3>
                <div className="flex items-center mb-3">
                    <div className="relative mr-3">
                        {attackerDetails && (
                          <>
                            <img 
                              src={getPokemonIconPath(attackerDetails.pokemonId)} 
                              alt={attackerPokemonName} 
                              className="w-12 h-12 drop-shadow-md" 
                            />
                            {attackerDetails.isStellar ? (
                                <img src="/images/Stellar_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="ステラ" />
                            ) : attackerDetails.teraType ? (
                                <img src="/images/Terastal_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="テラスタル" />
                            ) : null}
                          </>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {attackerDetails?.displayTypes && attackerDetails.displayTypes.map((type, idx) => (
                            type && <span 
                                key={`modal-attacker-type-${idx}`}
                                className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                                style={{ backgroundColor: getTypeColor(type) }}
                            >
                                {getTypeNameJp(type)}
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex justify-between">技の威力: <span className="font-semibold text-white">{attackerDetails?.movePower ?? '-'}</span></li>
                  {attackerDetails?.moveCategory && (
                    <li className="flex justify-between">技カテゴリ: <span className="font-semibold text-white">
                        {attackerDetails.moveCategory === 'physical' ? '物理' : attackerDetails.moveCategory === 'special' ? '特殊' : '変化'}
                    </span></li>
                  )}
                  <li className="flex justify-between">攻撃/特攻: <span className="font-semibold text-white">{attackerDetails?.offensiveStatValue ?? '-'}</span></li>
                  <li className="flex justify-between">ランク補正: <span className="font-semibold text-white">{(attackerDetails?.offensiveStatRank ?? 0) >= 0 ? `+${attackerDetails?.offensiveStatRank ?? 0}` : attackerDetails?.offensiveStatRank}</span></li>
                  {attackerDetails?.teraType && !attackerDetails.isStellar && <li className="flex justify-between">テラスタル: <span className="font-semibold text-white">{getTypeNameJp(attackerDetails.teraType)}</span></li>}
                  {attackerDetails?.isStellar && <li className="flex justify-between">テラスタル: <span className="font-semibold text-pink-400">{getTypeNameJp('stellar')}</span></li>}
                  {attackerDetails?.item && (
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">持ち物:</span>
                      <div className="flex items-center gap-1.5">
                        {renderItemIcon(attackerDetails.item)}
                        <span className="font-semibold text-white truncate max-w-[120px]" title={attackerDetails.item}>{attackerDetails.item}</span>
                      </div>
                    </li>
                  )}
                  {attackerDetails?.ability && (
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">特性:</span>
                      <span className="font-semibold text-white truncate max-w-[120px]" title={attackerDetails.ability}>{attackerDetails.ability}</span>
                    </li>
                  )}
                  {attackerDetails?.isBurned && <li className="text-red-400 font-bold border-t border-slate-700/50 pt-1.5 mt-1.5">火傷状態</li>}
                  {attackerDetails?.hasHelpingHand && <li className="text-emerald-400 font-bold border-t border-slate-700/50 pt-1.5 mt-1.5">てだすけ</li>}
                </ul>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-sm font-bold text-blue-400 mb-3 border-b border-slate-700/50 pb-2 flex items-center">
                    <span className="w-1.5 h-5 bg-blue-500 rounded-sm mr-2 inline-block"></span>
                    防御側: {defenderPokemonName}
                </h3>
                <div className="flex items-center mb-3">
                    <div className="relative mr-3">
                        {defenderDetails && (
                            <img 
                                src={getPokemonIconPath(defenderDetails.pokemonId)} 
                                alt={defenderPokemonName} 
                                className="w-12 h-12 drop-shadow-md"
                            />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {defenderDetails?.displayTypes && defenderDetails.displayTypes.map((type, idx) => (
                            type && <span 
                                key={`modal-defender-type-${idx}`}
                                className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                                style={{ backgroundColor: getTypeColor(type) }}
                            >
                                {getTypeNameJp(type)}
                            </span>
                        ))}
                    </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {defenderDetails?.maxHp && <li className="flex justify-between">最大HP: <span className="font-semibold text-white">{defenderDetails.maxHp}</span></li>}
                  <li className="flex justify-between">防御/特防: <span className="font-semibold text-white">{defenderDetails?.defensiveStatValue ?? '-'}</span></li>
                  <li className="flex justify-between">ランク補正: <span className="font-semibold text-white">{(defenderDetails?.defensiveStatRank ?? 0) >= 0 ? `+${defenderDetails?.defensiveStatRank ?? 0}` : defenderDetails?.defensiveStatRank}</span></li>
                  <li className="flex justify-between">タイプ相性: <span className="font-semibold text-white bg-slate-700/50 px-1.5 rounded">×{result.effectiveness?.toFixed(2) ?? '-'}</span></li>
                  {defenderDetails?.item && (
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">持ち物:</span>
                      <div className="flex items-center gap-1.5">
                        {renderItemIcon(defenderDetails.item)}
                        <span className="font-semibold text-white truncate max-w-[120px]" title={defenderDetails.item}>{defenderDetails.item}</span>
                      </div>
                    </li>
                  )}
                  {defenderDetails?.ability && (
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">特性:</span>
                      <span className="font-semibold text-white truncate max-w-[120px]" title={defenderDetails.ability}>{defenderDetails.ability}</span>
                    </li>
                  )}
                  {defenderDetails?.hasReflect && <li className="text-blue-300 border-t border-slate-700/50 pt-1.5 mt-1.5">リフレクター</li>}
                  {defenderDetails?.hasLightScreen && <li className="text-yellow-300 border-t border-slate-700/50 pt-1.5 mt-1.5">ひかりのかべ</li>}
                  {defenderDetails?.hasFriendGuard && <li className="text-purple-300 border-t border-slate-700/50 pt-1.5 mt-1.5">フレンドガード</li>}
                </ul>
              </div>
            </div>
            
            {((weather && weather !== 'none') || (field && field !== 'none') || (disasters && Object.values(disasters).some(d => d))) && (
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-sm font-bold text-indigo-400 mb-2 border-b border-slate-700/50 pb-2 flex items-center">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-sm mr-2 inline-block"></span>
                    バトルフィールド状態
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {weather && weather !== 'none' && (
                      <span className="bg-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 border border-slate-600/50">
                          天候: <span className="font-bold text-white ml-1">{WEATHER_NAME_JP[weather] || weather}</span>
                      </span>
                  )}
                  {field && field !== 'none' && (
                      <span className="bg-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 border border-slate-600/50">
                          フィールド: <span className="font-bold text-white ml-1">{FIELD_NAME_JP[field] || field}</span>
                      </span>
                  )}
                  {disasters && Object.entries(disasters).map(([key, value]) => 
                    value && (
                        <span key={key} className="bg-red-900/40 text-red-300 px-2.5 py-1.5 rounded-lg border border-red-800/50">
                            災い: <span className="font-bold text-red-400 ml-1">{disasterMap[key as keyof DisasterState]}</span>
                        </span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl py-3 px-4 border border-slate-700/30">
                  <h4 className="text-slate-300 font-semibold text-xs mb-3">通常ダメージ分布 {!isVariablePowerMove && hitCount > 1 && `(1回あたり)`}</h4>
                  <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                    {result.normalDamages.map((damageValue, i) => {
                      const factor = 0.85 + i * 0.01;
                      const percentage = defenderHP > 0 ? (damageValue / defenderHP) * 100 : 0;
                      return (
                        <div
                          key={`modal-normal-dist-${i}`}
                          className="bg-slate-900/80 p-1.5 rounded-md text-center border border-slate-700/50"
                        >
                          <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                          <div className={`${getDamageColor(percentage)} font-bold`}>{damageValue}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={result.parentalBondChild ? "bg-red-900/10 rounded-xl py-3 px-4 border border-red-900/20" : "bg-red-900/10 rounded-xl py-3 px-4 border border-red-900/20 mb-6"}>
                  <h4 className="text-red-400 font-semibold text-xs mb-3">急所ダメージ分布 {!isVariablePowerMove && hitCount > 1 && `(1回あたり)`}</h4>
                  <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                    {result.criticalDamages.map((damageValue, i) => {
                       const factor = 0.85 + i * 0.01;
                      const percentage = defenderHP > 0 ? (damageValue / defenderHP) * 100 : 0;
                      return (
                        <div
                          key={`modal-crit-dist-${i}`}
                          className="bg-slate-900/80 p-1.5 rounded-md text-center border border-red-900/30"
                        >
                          <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                          <div className={`${getDamageColor(percentage)} font-bold`}>{damageValue}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.parentalBondChild && (
                  <>
                    <div className="bg-slate-800/30 rounded-xl py-3 px-4 border border-slate-700/30">
                      <h4 className="text-slate-300 font-semibold text-xs mb-3">通常ダメージ分布 (おやこあい子)</h4>
                      <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                        {result.parentalBondChild.normalDamages.map((damageValue, i) => {
                          const factor = 0.85 + i * 0.01;
                          const percentage = defenderHP > 0 ? (damageValue / defenderHP) * 100 : 0;
                          return (
                            <div
                              key={`modal-bond-normal-dist-${i}`}
                              className="bg-slate-900/80 p-1.5 rounded-md text-center border border-slate-700/50"
                            >
                              <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                              <div className={`${getDamageColor(percentage)} font-bold`}>{damageValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-red-900/10 rounded-xl py-3 px-4 border border-red-900/20 mb-6">
                      <h4 className="text-red-400 font-semibold text-xs mb-3">急所ダメージ分布 (おやこあい子)</h4>
                      <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                        {result.parentalBondChild.criticalDamages.map((damageValue, i) => {
                          const factor = 0.85 + i * 0.01;
                          const percentage = defenderHP > 0 ? (damageValue / defenderHP) * 100 : 0;
                          return (
                            <div
                              key={`modal-bond-crit-dist-${i}`}
                              className="bg-slate-900/80 p-1.5 rounded-md text-center border border-red-900/30"
                            >
                              <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                              <div className={`${getDamageColor(percentage)} font-bold`}>{damageValue}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
            </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-lg px-5 py-4 flex gap-3 border-t border-slate-800 z-30 shrink-0">
            <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-slate-700"
            >
                閉じる
            </button>
        </div>
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