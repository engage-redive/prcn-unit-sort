import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  LoggedDamageEntry,
  PokemonType,
  DisasterState,
} from '../types';
import { useHistoryStore } from '../stores/historyStore';
import { X, Trash2, Info, RotateCcw } from 'lucide-react';

import { moves } from '../data/moves';
import { items } from '../data/items';
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

const getKOInfoHistory = (distMap: Map<number, number>, hp: number) => {
  if (distMap.size === 0) return "計算不可";
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
  return `乱数${minHits}発 (${formatPercentageHistory(pPercent)}%)`;
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

const getItemIdFromName = (itemName: string): string | null => {
  const item = items.find(i => i.name === itemName);
  return item ? item.id : null;
};

const renderItemIcon = (itemName: string | null, snapshotItemId?: string | null) => {
  if (!itemName) return null;
  const itemId = snapshotItemId || getItemIdFromName(itemName);
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

interface LogCardProps {
  logEntry: LoggedDamageEntry;
}

const LogCard: React.FC<LogCardProps> = ({ logEntry }) => {
  const { deleteLog, loadLogToCalculators } = useHistoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Escキーでモーダルを閉じる
  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, handleEscKey]);

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
  
  const effectiveHitCount = (isVariablePowerMove || result.isMultiHitCombined) ? 1 : hitCount;
  const normalDistMap = React.useMemo(() => getExactMultiHitDistribution(result.normalDamages, effectiveHitCount), [result.normalDamages, effectiveHitCount]);
  const criticalDistMap = React.useMemo(() => getExactMultiHitDistribution(result.criticalDamages, effectiveHitCount), [result.criticalDamages, effectiveHitCount]);
  
  const minMax = React.useMemo(() => {
    const nDmgs = Array.from(normalDistMap.keys());
    const cDmgs = Array.from(criticalDistMap.keys());
    return {
      nMin: Math.min(...nDmgs), nMax: Math.max(...nDmgs),
      cMin: Math.min(...cDmgs), cMax: Math.max(...cDmgs),
    };
  }, [normalDistMap, criticalDistMap]);

  const damagesForKO = isCritical ? criticalDistMap : normalDistMap;
  const koTextDisplay = getKOInfoHistory(damagesForKO, defenderOriginalHP);
  
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
    <>
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg mb-4 relative overflow-hidden flex flex-col">
      {/* ヘッダー領域 */}
      <div className="flex justify-between items-center bg-slate-900/50 p-2 px-4 border-b border-slate-700/50 relative z-10">
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
                {new Date(timestamp).toLocaleString()}
            </span>
            {isDoubleBattle && <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/80 text-white rounded font-medium border border-blue-400/50 tracking-wider">ダブル</span>}
            {isCritical && <span className="px-1.5 py-0.5 text-[10px] bg-red-500/80 text-white rounded font-medium border border-red-400/50 tracking-wider">急所</span>}
        </div>
        <button
          onClick={handleDeleteClick}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
          aria-label="ログを削除"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col md:flex-row items-center md:items-stretch gap-4 lg:gap-6 relative z-10">
        {/* 攻撃側 */}
        <div className="flex-1 w-full bg-slate-900/40 rounded-lg p-3 flex flex-col border border-slate-700/30 relative">
          <div className="absolute top-2 left-2 text-[10px] text-red-400 font-bold tracking-wider opacity-60">ATTACKER</div>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="relative">
              <img
                src={getPokemonIconPath(attackerDetails.pokemonId)}
                alt={attackerDetails.pokemonName}
                className="w-14 h-14 drop-shadow-md relative z-10"
              />
              {/* ギミックアイコン (攻撃側) */}
              {attackerDetails.isStellar ? (
                 <img src="/images/Stellar_icon.png" className="absolute -bottom-2 -right-2 w-6 h-6 z-20 drop-shadow-md" alt="ステラ" />
              ) : attackerDetails.teraType ? (
                 <img src="/images/Terastal_icon.png" className="absolute -bottom-2 -right-2 w-6 h-6 z-20 drop-shadow-md" alt="テラスタル" />
              ) : null}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-white truncate w-full" title={attackerDetails.pokemonName}>
                {attackerDetails.pokemonName}
              </span>
              <div className="flex flex-col space-y-0.5 mt-1 text-[11px] text-slate-300">
                {attackerDetails.item && (
                  <div className="flex items-center gap-1.5 truncate w-full">
                    {renderItemIcon(attackerDetails.item, logEntry.attackerStateSnapshot?.itemId)}
                    <span className="truncate">{attackerDetails.item}</span>
                  </div>
                )}
                {attackerDetails.ability && (
                  <div className="flex items-center gap-1 truncate w-full">
                    <span className="truncate">特性: {attackerDetails.ability}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 truncate w-full text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">攻/特攻: <span className="text-slate-300">{attackerDetails.offensiveStatValue}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中央: ダメージ＆技情報 */}
        <div className="flex-1 w-full flex flex-col items-center justify-center py-2 md:py-0">
            <div className="text-center mb-2 w-full flex flex-col items-center">
                <p className="font-bold text-sm text-white bg-slate-700/50 py-1 px-3 rounded-full inline-block border border-slate-600/50 shadow-sm truncate max-w-full">
                    {attackerMoveName}
                    {hitCount > 1 && <span className="text-[11px] text-slate-300 ml-1">({hitCount}回)</span>}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] text-slate-400 flex-wrap">
                  {moveData?.type && (
                    <span className="flex items-center gap-1">
                      <img src={`/typesIcon/${moveData.type}_icon_sv.png`} alt={moveData.type} className="w-3 h-3 drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <span className="text-slate-300">{getTypeNameJpFromHistory(moveData.type)}</span>
                    </span>
                  )}
                  {attackerDetails.moveCategory && (
                    <span className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700/50 text-slate-300 leading-none">
                      {attackerDetails.moveCategory === 'physical' ? '物理' : attackerDetails.moveCategory === 'special' ? '特殊' : '変化'}
                    </span>
                  )}
                  <span className="truncate">威力: <span className="text-slate-200">{attackerDetails.movePower ?? '-'}</span></span>
                </div>
            </div>
            
            <p className="text-xl font-bold my-1 drop-shadow-md text-center shrink-0">
                <span className={getDamageColorHistory(minPercentageDisplay)}>{minDamageDisplay}</span>
                <span className="text-slate-500 mx-1">~</span>
                <span className={getDamageColorHistory(maxPercentageDisplay)}>{maxDamageDisplay}</span>
            </p>
            <p className="text-xs text-slate-400 font-mono shrink-0">
                ({formatPercentageHistory(minPercentageDisplay)}% ~ {formatPercentageHistory(maxPercentageDisplay)}%)
            </p>
            
            <div className="mt-2 text-center shrink-0">
               <span className="text-[13px] font-bold text-yellow-500 drop-shadow-sm px-2 py-0.5 bg-yellow-900/30 rounded border border-yellow-700/30 flex items-center justify-center min-h-[28px]">
                 {koTextDisplay}
               </span>
            </div>
        </div>

        {/* 防御側 */}
        <div className="flex-1 w-full bg-slate-900/40 rounded-lg p-3 flex flex-col border border-slate-700/30 relative">
          <div className="absolute top-2 right-2 text-[10px] text-blue-400 font-bold tracking-wider opacity-60">DEFENDER</div>
          
          <div className="flex items-center gap-3 mt-3 flex-row-reverse md:flex-row text-right md:text-left">
            <div className="relative">
              <img
                src={getPokemonIconPath(defenderDetails.pokemonId)}
                alt={defenderDetails.pokemonName}
                className="w-14 h-14 drop-shadow-md relative z-10"
              />
              {/* ギミックアイコン (防御側) */}
              {logEntry.defenderStateSnapshot.isStellar ? (
                 <img src="/images/Stellar_icon.png" className="absolute -bottom-2 -right-2 w-6 h-6 z-20 drop-shadow-md transform md:translate-x-0 -translate-x-full md:left-auto md:right-auto right-0" alt="ステラ" />
              ) : logEntry.defenderStateSnapshot.teraType ? (
                 <img src="/images/Terastal_icon.png" className="absolute -bottom-2 -right-2 w-6 h-6 z-20 drop-shadow-md transform md:translate-x-0 -translate-x-full md:left-auto md:right-auto right-0" alt="テラスタル" />
              ) : null}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-white truncate w-full" title={defenderDetails.pokemonName}>
                {defenderDetails.pokemonName}
              </span>
              <div className="flex flex-col space-y-0.5 mt-1 text-[11px] text-slate-300 items-end md:items-start">
                {defenderDetails.item && (
                  <div className="flex items-center gap-1.5 truncate w-full justify-end md:justify-start">
                    {renderItemIcon(defenderDetails.item, logEntry.defenderStateSnapshot?.itemId)}
                    <span className="truncate">{defenderDetails.item}</span>
                  </div>
                )}
                {defenderDetails.ability && (
                  <div className="flex items-center gap-1 truncate w-full justify-end md:justify-start">
                    <span className="truncate">特性: {defenderDetails.ability}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 truncate w-full justify-end md:justify-start text-[10px] text-slate-400 mt-0.5">
                  <span className="truncate">防/特防: <span className="text-slate-300">{defenderDetails.defensiveStatValue}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* HPバーエリア */}
      <div className="px-5 pb-4 relative z-10 w-[95%] mx-auto">
        <div className="flex justify-end text-[10px] text-slate-400 mb-1 px-1 font-mono">
          <span>Max {defenderOriginalHP}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
          <div className="h-full relative transition-all duration-300">
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
      </div>

      {/* フッターアクション */}
      <div className="flex border-t border-slate-700/50 bg-slate-900/30 relative z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 py-2.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800/80 transition-colors flex items-center justify-center font-medium border-r border-slate-700/50"
        >
          <Info size={14} className="mr-1.5"/> 詳細データ
        </button>
        <button
          onClick={handleLoadClick}
          className="flex-1 py-2.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/80 transition-colors flex items-center justify-center font-medium disabled:text-slate-600 disabled:hover:bg-transparent"
          disabled={!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot}
          title={(!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot) ? "古い形式のログは復元できません" : "この計算を復元"}
        >
          <RotateCcw size={14} className="mr-1.5"/> 復元する
        </button>
      </div>
    </div>

      {/* モーダル: React Portalで独立レイヤーに描画 */}
      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="計算ログ詳細"
        >
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative">
            {/* ヘッダー (sticky) */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg px-5 py-4 flex justify-between items-center border-b border-slate-800 z-30 shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Info size={20} className="mr-2 text-blue-400" />
                  計算ログ詳細
                </h2>
                <button
                  className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>

            {/* スクロール可能なコンテンツ */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
                {/* サマリー */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200 flex items-center">
                      <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 font-bold text-[11px] flex items-center justify-center mr-2 shrink-0">攻</span>
                      <img src={getPokemonIconPath(attackerDetails.pokemonId)} alt="" className="w-6 h-6 mr-1.5 shrink-0" />
                      {attackerPokemonName} → {attackerMoveName}
                      {hitCount > 1 && <span className="text-slate-400 ml-1 text-xs">({hitCount}回)</span>}
                    </p>
                    <p className="text-sm font-medium text-slate-200 flex items-center">
                      <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 font-bold text-[11px] flex items-center justify-center mr-2 shrink-0">防</span>
                      <img src={getPokemonIconPath(defenderDetails.pokemonId)} alt="" className="w-6 h-6 mr-1.5 shrink-0" />
                      {defenderPokemonName}
                      <span className="text-slate-400 ml-1.5 text-xs">(HP: {defenderOriginalHP})</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isDoubleBattle && <span className="px-2 py-0.5 text-[10px] bg-blue-500/80 text-white rounded font-medium border border-blue-400/50">ダブル</span>}
                    {isCritical && <span className="px-2 py-0.5 text-[10px] bg-red-500/80 text-white rounded font-medium border border-red-400/50">急所モード</span>}
                  </div>
                </div>
                
                {/* ダメージ結果 */}
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-gray-900 rounded border-l-4 border-gray-400">
                    <p className="text-xs text-gray-400 mb-1">通常</p>
                    <p className="font-bold text-white text-lg">
                      {minMax.nMin} - {minMax.nMax}
                      <span className="text-sm ml-2 text-gray-400">({formatPercentageHistory((minMax.nMin / defenderOriginalHP) * 100)}% - {formatPercentageHistory((minMax.nMax / defenderOriginalHP) * 100)}%)</span>
                      <span className="ml-2 text-blue-300 text-sm font-medium">{getKOInfoHistory(normalDistMap, defenderOriginalHP)}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border-l-4 border-red-500">
                    <p className="text-xs text-red-400 mb-1">急所</p>
                    <p className="font-bold text-white text-lg">
                      {minMax.cMin} - {minMax.cMax}
                      <span className="text-sm ml-2 text-gray-400">({formatPercentageHistory((minMax.cMin / defenderOriginalHP) * 100)}% - {formatPercentageHistory((minMax.cMax / defenderOriginalHP) * 100)}%)</span>
                      <span className="ml-2 text-red-300 text-sm font-medium">{getKOInfoHistory(criticalDistMap, defenderOriginalHP)}</span>
                    </p>
                  </div>
                </div>

                {/* 攻撃側・防御側 詳細 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 攻撃側 */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <h3 className="text-sm font-bold text-red-400 mb-3 border-b border-slate-700/50 pb-2 flex items-center">
                        <span className="w-1.5 h-5 bg-red-500 rounded-sm mr-2 inline-block"></span>
                        攻撃側: {attackerDetails.pokemonName}
                    </h3>
                    <div className="flex items-center mb-3">
                        <div className="relative mr-3">
                            <img 
                              src={getPokemonIconPath(attackerDetails.pokemonId)} 
                              alt={attackerDetails.pokemonName} 
                              className="w-12 h-12 drop-shadow-md" 
                            />
                            {attackerDetails.isStellar ? (
                                <img src="/images/Stellar_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="ステラ" />
                            ) : attackerDetails.teraType ? (
                                <img src="/images/Terastal_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="テラスタル" />
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {Array.isArray(attackerDetails.displayTypes) && attackerDetails.displayTypes.map((type, idx) => (
                                type && <span 
                                    key={`modal-attacker-type-${idx}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                                    style={{ backgroundColor: getTypeColorFromHistory(type as PokemonType | 'stellar') }}
                                >
                                    {getTypeNameJpFromHistory(type as PokemonType | 'stellar')}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex justify-between">技の威力: <span className="font-semibold text-white">{attackerDetails.movePower}</span></li>
                      {attackerDetails.moveCategory && (
                        <li className="flex justify-between">技カテゴリ: <span className="font-semibold text-white">
                            {attackerDetails.moveCategory === 'physical' ? '物理' : attackerDetails.moveCategory === 'special' ? '特殊' : '変化'}
                        </span></li>
                      )}
                      <li className="flex justify-between">攻撃/特攻: <span className="font-semibold text-white">{attackerDetails.offensiveStatValue}</span></li>
                      <li className="flex justify-between">ランク補正: <span className="font-semibold text-white">{attackerDetails.offensiveStatRank >= 0 ? `+${attackerDetails.offensiveStatRank}` : attackerDetails.offensiveStatRank}</span></li>
                      {attackerDetails.teraType && !attackerDetails.isStellar && <li className="flex justify-between">テラスタル: <span className="font-semibold text-white">{getTypeNameJpFromHistory(attackerDetails.teraType)}</span></li>}
                      {attackerDetails.isStellar && <li className="flex justify-between">テラスタル: <span className="font-semibold text-pink-400">{getTypeNameJpFromHistory('stellar')}</span></li>}
                      {attackerDetails.item && (
                        <li className="flex justify-between items-center">
                          <span className="flex items-center">持ち物:</span>
                          <div className="flex items-center gap-1.5">
                            {renderItemIcon(attackerDetails.item, logEntry.attackerStateSnapshot?.itemId)}
                            <span className="font-semibold text-white truncate max-w-[120px]" title={attackerDetails.item || undefined}>{attackerDetails.item}</span>
                          </div>
                        </li>
                      )}
                      {attackerDetails.ability && (
                        <li className="flex justify-between items-center">
                          <span className="flex items-center">特性:</span>
                          <span className="font-semibold text-white truncate max-w-[120px]" title={attackerDetails.ability || undefined}>{attackerDetails.ability}</span>
                        </li>
                      )}
                      {attackerDetails.isBurned && <li className="text-red-400 font-bold border-t border-slate-700/50 pt-1.5 mt-1.5">火傷状態</li>}
                      {attackerDetails.hasHelpingHand && <li className="text-emerald-400 font-bold border-t border-slate-700/50 pt-1.5 mt-1.5">てだすけ</li>}
                    </ul>
                  </div>

                  {/* 防御側 */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <h3 className="text-sm font-bold text-blue-400 mb-3 border-b border-slate-700/50 pb-2 flex items-center">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-sm mr-2 inline-block"></span>
                        防御側: {defenderDetails.pokemonName}
                    </h3>
                    <div className="flex items-center mb-3">
                        <div className="relative mr-3">
                            <img 
                                src={getPokemonIconPath(defenderDetails.pokemonId)} 
                                alt={defenderDetails.pokemonName} 
                                className="w-12 h-12 drop-shadow-md"
                            />
                            {logEntry.defenderStateSnapshot.isStellar ? (
                                <img src="/images/Stellar_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="ステラ" />
                            ) : logEntry.defenderStateSnapshot.teraType ? (
                                <img src="/images/Terastal_icon.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20 drop-shadow" alt="テラスタル" />
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {Array.isArray(defenderDetails.displayTypes) && defenderDetails.displayTypes.map((type, idx) => (
                                type && <span 
                                    key={`modal-defender-type-${idx}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                                    style={{ backgroundColor: getTypeColorFromHistory(type) }}
                                >
                                    {getTypeNameJpFromHistory(type)}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {defenderDetails.maxHp && <li className="flex justify-between">最大HP: <span className="font-semibold text-white">{defenderDetails.maxHp}</span></li>}
                      <li className="flex justify-between">防御/特防: <span className="font-semibold text-white">{defenderDetails.defensiveStatValue}</span></li>
                      <li className="flex justify-between">ランク補正: <span className="font-semibold text-white">{defenderDetails.defensiveStatRank >= 0 ? `+${defenderDetails.defensiveStatRank}` : defenderDetails.defensiveStatRank}</span></li>
                      <li className="flex justify-between">タイプ相性: <span className="font-semibold text-white bg-slate-700/50 px-1.5 rounded">×{result.effectiveness.toFixed(2)}</span></li>
                      {defenderDetails.item && (
                        <li className="flex justify-between items-center">
                          <span className="flex items-center">持ち物:</span>
                          <div className="flex items-center gap-1.5">
                            {renderItemIcon(defenderDetails.item, logEntry.defenderStateSnapshot?.itemId)}
                            <span className="font-semibold text-white truncate max-w-[120px]" title={defenderDetails.item || undefined}>{defenderDetails.item}</span>
                          </div>
                        </li>
                      )}
                      {defenderDetails.ability && (
                        <li className="flex justify-between items-center">
                          <span className="flex items-center">特性:</span>
                          <span className="font-semibold text-white truncate max-w-[120px]" title={defenderDetails.ability || undefined}>{defenderDetails.ability}</span>
                        </li>
                      )}
                      {defenderDetails.hasReflect && <li className="text-blue-300 border-t border-slate-700/50 pt-1.5 mt-1.5">リフレクター</li>}
                      {defenderDetails.hasLightScreen && <li className="text-yellow-300 border-t border-slate-700/50 pt-1.5 mt-1.5">ひかりのかべ</li>}
                      {defenderDetails.hasFriendGuard && <li className="text-purple-300 border-t border-slate-700/50 pt-1.5 mt-1.5">フレンドガード</li>}
                    </ul>
                  </div>
                </div>
                
                {/* フィールド状態 */}
                {(globalStatesSnapshot?.weather || globalStatesSnapshot?.field || (globalStatesSnapshot?.disasters && Object.values(globalStatesSnapshot.disasters).some(d => d))) && (
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <h3 className="text-sm font-bold text-indigo-400 mb-2 border-b border-slate-700/50 pb-2 flex items-center">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-sm mr-2 inline-block"></span>
                        バトルフィールド状態
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {globalStatesSnapshot?.weather && globalStatesSnapshot.weather !== 'none' && (
                          <span className="bg-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 border border-slate-600/50">
                              天候: <span className="font-bold text-white ml-1">{WEATHER_NAME_JP_HISTORY[globalStatesSnapshot.weather as keyof typeof WEATHER_NAME_JP_HISTORY] || globalStatesSnapshot.weather}</span>
                          </span>
                      )}
                      {globalStatesSnapshot?.field && globalStatesSnapshot.field !== 'none' && (
                          <span className="bg-slate-700/80 px-2.5 py-1.5 rounded-lg text-slate-200 border border-slate-600/50">
                              フィールド: <span className="font-bold text-white ml-1">{FIELD_NAME_JP_HISTORY[globalStatesSnapshot.field as keyof typeof FIELD_NAME_JP_HISTORY] || globalStatesSnapshot.field}</span>
                          </span>
                      )}
                      {globalStatesSnapshot?.disasters && Object.entries(globalStatesSnapshot.disasters).map(([key, value]) => 
                        value && (
                            <span key={key} className="bg-red-900/40 text-red-300 px-2.5 py-1.5 rounded-lg border border-red-800/50">
                                災い: <span className="font-bold text-red-400 ml-1">{DISASTER_MAP_HISTORY[key as keyof DisasterState]}</span>
                            </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* ダメージ分布 */}
                <div className="space-y-4">
                    <div className="bg-slate-800/30 rounded-xl py-3 px-4 border border-slate-700/30">
                      <h4 className="text-slate-300 font-semibold text-xs mb-3">通常ダメージ分布 {hitCount > 1 && `(1回あたり)`}</h4>
                      <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                        {result.normalDamages.map((damageValue, i) => {
                          const factor = 0.85 + i * 0.01;
                          const totalDamage = isVariablePowerMove ? damageValue : (damageValue * hitCount);
                          const percentage = defenderOriginalHP > 0 ? (totalDamage / defenderOriginalHP) * 100 : 0;
                          return (
                            <div
                              key={`modal-normal-dist-${i}`}
                              className="bg-slate-900/80 p-1.5 rounded-md text-center border border-slate-700/50"
                            >
                              <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                              <div className={`${getDamageColorHistory(percentage)} font-bold`}>{totalDamage}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-red-900/10 rounded-xl py-3 px-4 border border-red-900/20">
                      <h4 className="text-red-400 font-semibold text-xs mb-3">急所ダメージ分布 {hitCount > 1 && `(1回あたり)`}</h4>
                      <div className="grid grid-cols-8 gap-1 text-[9px] sm:text-[10px]">
                        {result.criticalDamages.map((damageValue, i) => {
                           const factor = 0.85 + i * 0.01;
                           const totalDamage = isVariablePowerMove ? damageValue : (damageValue * hitCount);
                          const percentage = defenderOriginalHP > 0 ? (totalDamage / defenderOriginalHP) * 100 : 0;
                          return (
                            <div
                              key={`modal-crit-dist-${i}`}
                              className="bg-slate-900/80 p-1.5 rounded-md text-center border border-red-900/30"
                            >
                              <div className="text-slate-500 mb-0.5 text-[8px]">×{factor.toFixed(2)}</div>
                              <div className={`${getDamageColorHistory(percentage)} font-bold`}>{totalDamage}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                </div>
            </div>

            {/* フッター (sticky) */}
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-lg px-5 py-4 flex gap-3 border-t border-slate-800 z-30 shrink-0">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-slate-700"
                >
                    閉じる
                </button>
                <button
                    onClick={handleLoadClick}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 shadow-lg shadow-emerald-900/20"
                    disabled={!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot}
                >
                    <RotateCcw size={18} className="mr-2"/> 
                    {(!logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot) ? "復元不可" : "この計算状態を復元する"}
                </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default LogCard;