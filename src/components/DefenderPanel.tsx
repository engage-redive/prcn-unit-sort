// src/components/DefenderPanel.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pokemon, NatureModifier, Item, Ability, PokemonType, ProtosynthesisBoostTarget } from '../types';
import PokemonSelect from './PokemonSelect';
import ItemSelect from './ItemSelect';
import AbilitySelect from './AbilitySelect';
import StatSlider from './StatSlider';
import RankSelector from './RankSelector';
import { useGlobalStateStore } from '../stores/globalStateStore';
import { useDefenderStore } from '../stores/defenderStore';
import { getTypeNameJp, getTypeColor, getPokemonIconPath } from '../utils/uiHelpers';

const ALL_POKEMON_TYPES = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"] as const;
const PROTOSYNTHESIS_ABILITY_ID = 'protosynthesis';
const QUARK_DRIVE_ABILITY_ID = 'quark_drive';

interface DefenderPanelProps {
  pokemonList: Pokemon[];
  items: Item[];
  abilities: Ability[];
  showDefender2: boolean; 
}

const DefenderPanel: React.FC<DefenderPanelProps> = ({
  pokemonList,
  items,
  abilities,
  showDefender2,
}) => {
  const { 
    hasReflect, setHasReflect, 
    hasLightScreen, setHasLightScreen, 
    hasFriendGuard, setHasFriendGuard, 
    defenderIsTerastallized, setDefenderIsTerastallized 
  } = useGlobalStateStore();
  
  // ▼▼▼ ここを修正 ▼▼▼
  // 個別のプロパティを分割代入するのではなく、ストアの状態を一つのオブジェクトとして取得
  const defenderState = useDefenderStore();
  const {
    pokemon: selectedPokemon, item: selectedItem, ability: selectedAbility,
    hpStat, defenseStat, specialDefenseStat,
    hpInputValue, defenseInputValue, specialDefenseInputValue,
    defender2Item, defender2Ability, userModifiedTypes,
    setPokemon, updateStat, updateStatValue, updateStatFromInput,
    setDefenderState, setDefender2Item, setDefender2Ability, setUserModifiedTypes,
    changeFormKeepStats,
  } = defenderState;
  // ▲▲▲ ここまで修正 ▲▲▲

  const baseSpeciesId = useMemo(
    () => selectedPokemon?.baseSpecies || (selectedPokemon?.id ? String(selectedPokemon.id) : undefined),
    [selectedPokemon]
  );
  const megaForms = useMemo(() => {
    if (!baseSpeciesId || !pokemonList) return [];
    return pokemonList.filter(p => p.isMega && p.baseSpecies === baseSpeciesId);
  }, [baseSpeciesId, pokemonList]);

  const [showType1Dropdown, setShowType1Dropdown] = useState(false);
  const [showType2Dropdown, setShowType2Dropdown] = useState(false);
  const type1DropdownRef = useRef<HTMLDivElement>(null);
  const type2DropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (type1DropdownRef.current && !type1DropdownRef.current.contains(event.target as Node)) {
        setShowType1Dropdown(false);
      }
      if (type2DropdownRef.current && !type2DropdownRef.current.contains(event.target as Node)) {
        setShowType2Dropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateBaseStatValue = (base: number, statPoints: number, nature: NatureModifier, isHpStat: boolean = false): number => {
    if (!base || base <= 0) return 0;
    if (isHpStat) {
      if (base === 1) return 1;
      return Math.floor((base + 20 + statPoints) * nature);
    }
    return Math.floor((base + 20 + statPoints) * nature);
  };
  
  const handleHpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => updateStatValue('hp', e.target.value);
  const handleDefenseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => updateStatValue('defense', e.target.value);
  const handleSpecialDefenseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => updateStatValue('specialDefense', e.target.value);

  const handleHpInputBlur = () => updateStatFromInput('hp');
  const handleDefenseInputBlur = () => updateStatFromInput('defense');
  const handleSpecialDefenseInputBlur = () => updateStatFromInput('specialDefense');
  
  const handleHpEvChangeDirect = (sp: number) => updateStat('hp', { statPoints: sp });
  const handleDefenseEvChangeDirect = (sp: number) => updateStat('defense', { statPoints: sp });
  const handleSpecialDefenseEvChangeDirect = (sp: number) => updateStat('specialDefense', { statPoints: sp });
  
  const handleDefenseNatureChangeDirect = (nature: NatureModifier) => updateStat('defense', { nature });
  const handleSpecialDefenseNatureChangeDirect = (nature: NatureModifier) => updateStat('specialDefense', { nature });

  const handleDefenseRankChangeDirect = (rank: number) => updateStat('defense', { rank });
  const handleSpecialDefenseRankChangeDirect = (rank: number) => updateStat('specialDefense', { rank });

  const isProtosynthesisSelectedOnDefender = selectedAbility?.id === PROTOSYNTHESIS_ABILITY_ID && selectedPokemon;
  const isQuarkDriveSelectedOnDefender = selectedAbility?.id === QUARK_DRIVE_ABILITY_ID && selectedPokemon;
    
  const boostableStats: { value: ProtosynthesisBoostTarget; label: string }[] = [
    { value: 'attack', label: '攻撃' }, { value: 'defense', label: '防御' },
    { value: 'specialAttack', label: '特攻' }, { value: 'specialDefense', label: '特防' },
    { value: 'speed', label: '素早さ' },
  ];

  const hpBaseValueForDisplay = selectedPokemon ? calculateBaseStatValue(selectedPokemon.baseStats.hp, hpStat.statPoints, hpStat.nature, true) : 0;
  const defenseBaseValueForDisplay = selectedPokemon ? calculateBaseStatValue(selectedPokemon.baseStats.defense, defenseStat.statPoints, defenseStat.nature) : 0;
  const specialDefenseBaseValueForDisplay = selectedPokemon ? calculateBaseStatValue(selectedPokemon.baseStats.specialDefense, specialDefenseStat.statPoints, specialDefenseStat.nature) : 0;

  const currentTypes: [PokemonType, PokemonType?] = useMemo(() => {
    if (defenderIsTerastallized && selectedPokemon && defenderState.teraType) return [defenderState.teraType];
    if (userModifiedTypes) return userModifiedTypes;
    if (selectedPokemon) return [selectedPokemon.types[0], selectedPokemon.types[1] || undefined];
    return ['normal'];
  }, [selectedPokemon, defenderIsTerastallized, userModifiedTypes]);

  const handleSelectType1 = (newType: PokemonType) => {
    if (defenderIsTerastallized) {
      setDefenderState({ teraType: newType, isStellar: false });
    } else {
      const currentType2 = userModifiedTypes ? userModifiedTypes[1] : (selectedPokemon?.types[1] || undefined);
      const newType2 = newType === currentType2 ? undefined : currentType2;
      setUserModifiedTypes([newType, newType2]);
    }
    setShowType1Dropdown(false);
  };

  const handleSelectType2 = (newType?: PokemonType) => {
    if (!defenderIsTerastallized) {
      const currentType1 = userModifiedTypes ? userModifiedTypes[0] : (selectedPokemon?.types[0] || 'normal');
      setUserModifiedTypes([currentType1, newType]);
    }
    setShowType2Dropdown(false);
  };

  const handleResetTypes = () => {
    setUserModifiedTypes(null);
    setDefenderIsTerastallized(false);
    setDefenderState({ teraType: null, isStellar: false });
  };

  const handleTerastallizedToggle = (checked: boolean) => {
    setDefenderIsTerastallized(checked);
    if (checked) {
      if (!defenderState?.teraType && currentTypes[0]) {
        setDefenderState({ teraType: currentTypes[0], isStellar: false });
      }
    } else {
      setDefenderState({ teraType: null, isStellar: false });
    }
  };

  const type1ButtonText = currentTypes[0] ? getTypeNameJp(currentTypes[0]) : 'タイプ1';
  const type2ButtonText = currentTypes[1] ? getTypeNameJp(currentTypes[1]) : (defenderIsTerastallized ? '' : 'タイプ2');

  const userConfigurableBaseTypes: [PokemonType, PokemonType?] = userModifiedTypes ?? (selectedPokemon ? [selectedPokemon.types[0], selectedPokemon.types[1] || undefined] : ['normal', undefined]);
  const availableTypesForType1 = ALL_POKEMON_TYPES.filter(t => defenderIsTerastallized || t !== userConfigurableBaseTypes[1]);
  const availableTypesForType2 = ALL_POKEMON_TYPES.filter(t => t !== userConfigurableBaseTypes[0]);

  return (
    <div className="bg-gray-900 p-1 rounded-lg shadow-lg">
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">防御側</h3>
        </div>
        {selectedPokemon && (
          <div className="flex items-center gap-3 mb-3">
            <img src={getPokemonIconPath(selectedPokemon.id)} alt={selectedPokemon.name} className="w-8 h-8" />
            <div className="flex flex-col">
              <div className="flex gap-1">
                {selectedPokemon.types.map((type, typeIndex) => (
                  <span key={typeIndex} className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getTypeColor(type) }}>
                    {getTypeNameJp(type)}
                  </span>
                ))}
              </div>
              <div className="text-sm font-mono text-gray-300 mt-1">
                H{selectedPokemon.baseStats.hp} A{selectedPokemon.baseStats.attack} B{selectedPokemon.baseStats.defense} C{selectedPokemon.baseStats.specialAttack} D{selectedPokemon.baseStats.specialDefense} S{selectedPokemon.baseStats.speed}
              </div>
            </div>
            {megaForms.length > 0 && (
              <div className="flex gap-2 ml-auto items-center">
                {megaForms.map((mega) => {
                  const isActive = selectedPokemon?.id === mega.id;
                  return (
                    <button
                      key={mega.id}
                      title={mega.name}
                      onClick={() => {
                        if (isActive) {
                          const basePokemon = pokemonList.find((p) => String(p.id) === baseSpeciesId);
                          if (basePokemon) changeFormKeepStats(basePokemon);
                        } else {
                          changeFormKeepStats(mega);
                        }
                      }}
                      className={`relative w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                        isActive ? 'opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/10' : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={getPokemonIconPath(mega.id)} className="w-8 h-8 object-contain z-10" alt={mega.name} />
                      <img src="/images/Mega_Evolution.png" className="absolute -bottom-1 -right-1 w-5 h-5 z-20" alt="メガシンカ" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <PokemonSelect pokemon={pokemonList} selected={selectedPokemon} onChange={(p) => setPokemon(p)} label="ポケモン" />

        {selectedPokemon && (
          <div className="mt-4">
            <div className="flex items-center mb-1">
              <label className="text-sm font-medium text-gray-300 mr-2">タイプ</label>
              <input type="checkbox" id="defender1Terastallized" checked={defenderIsTerastallized} onChange={(e) => handleTerastallizedToggle(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" disabled={!selectedPokemon} />
              <label htmlFor="defender1Terastallized" className={`ml-1 text-sm ${!selectedPokemon ? 'text-gray-500' : 'text-white'}`}>テラスタル</label>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-1/2" ref={type1DropdownRef}>
                <button onClick={() => setShowType1Dropdown(!showType1Dropdown)} className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center">
                  {type1ButtonText}
                  <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${showType1Dropdown ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showType1Dropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {availableTypesForType1.map((t) => (
                      <div key={`type1-${t}`} onClick={() => handleSelectType1(t as PokemonType)} className="px-4 py-2 text-sm text-white hover:bg-gray-600 cursor-pointer">{getTypeNameJp(t)}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative w-1/2" ref={type2DropdownRef}>
                <button onClick={() => setShowType2Dropdown(!showType2Dropdown)} className={`w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center ${defenderIsTerastallized ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={defenderIsTerastallized}>
                  {type2ButtonText}
                  <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${showType2Dropdown ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showType2Dropdown && !defenderIsTerastallized && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div onClick={() => handleSelectType2(undefined)} className="px-4 py-2 text-sm text-white hover:bg-gray-600 cursor-pointer">なし</div>
                    {availableTypesForType2.map((t) => (
                      <div key={`type2-${t}`} onClick={() => handleSelectType2(t as PokemonType)} className="px-4 py-2 text-sm text-white hover:bg-gray-600 cursor-pointer">{getTypeNameJp(t)}</div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleResetTypes} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900" title="タイプをリセット">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 bg-slate-700 rounded-lg mt-1.5 mb-1.5 shadow">
          <span className="text-sm font-medium text-gray-300 whitespace-nowrap pl-1 w-20">持ち物</span>
          <div className="w-full"><ItemSelect items={items} selected={selectedItem} onChange={(item) => setDefenderState({ item })} label="" side="defender" disabled={!selectedPokemon || !!selectedPokemon.isMega} /></div>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 bg-slate-700 rounded-lg mt-1.5 mb-1.5 shadow">
          <span className="text-sm font-medium text-gray-300 whitespace-nowrap pl-1 w-20">特性</span>
          <div className="w-full"><AbilitySelect abilities={abilities} selected={selectedAbility} onChange={(ability) => setDefenderState({ ability })} label="" side="defender" selectedPokemon={selectedPokemon} disabled={!selectedPokemon} /></div>
        </div>
        
        {isProtosynthesisSelectedOnDefender && (
          <div className="mt-3 p-3 border border-yellow-600/50 rounded-md bg-yellow-900/30 space-y-3">
            <p className="text-sm text-yellow-300 -mb-1">こだいかっせい 設定:</p>
            <div>
              <label htmlFor="proto-manual-defender" className="flex items-center text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  id="proto-manual-defender"
                  className="h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-offset-gray-800"
                  // ▼▼▼ defenderState オブジェクトから参照するように修正 ▼▼▼
                  checked={!!defenderState.protosynthesisManualTrigger}
                  onChange={(e) => setDefenderState({ protosynthesisManualTrigger: e.target.checked })}
                  disabled={!selectedPokemon}
                />
                <span className="ml-2">手動で発動する</span>
              </label>
            </div>
            <div>
              <label htmlFor="proto-stat-defender" className="block text-sm font-medium text-white mb-1">上昇させる能力:</label>
              <select
                id="proto-stat-defender"
                // ▼▼▼ defenderState オブジェクトから参照するように修正 ▼▼▼
                value={defenderState.protosynthesisBoostedStat ?? ''}
                onChange={(e) => setDefenderState({ protosynthesisBoostedStat: e.target.value ? (e.target.value as ProtosynthesisBoostTarget) : undefined })}
                disabled={!selectedPokemon}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-white"
              >
                <option value="">選択してください</option>
                {boostableStats.map(stat => (
                  <option key={stat.value || 'none'} value={stat.value || ''}>{stat.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isQuarkDriveSelectedOnDefender && (
          <div className="mt-3 p-3 border border-purple-600/50 rounded-md bg-purple-900/30 space-y-3">
            <p className="text-sm text-purple-300 -mb-1">クォークチャージ 設定:</p>
            <div>
              <label htmlFor="quark-manual-defender" className="flex items-center text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  id="quark-manual-defender"
                  className="h-4 w-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-400 focus:ring-offset-gray-800"
                  // ▼▼▼ defenderState オブジェクトから参照するように修正 ▼▼▼
                  checked={!!defenderState.quarkDriveManualTrigger}
                  onChange={(e) => setDefenderState({ quarkDriveManualTrigger: e.target.checked })}
                  disabled={!selectedPokemon}
                />
                <span className="ml-2">手動で発動する</span>
              </label>
            </div>
            <div>
              <label htmlFor="quark-stat-defender" className="block text-sm font-medium text-white mb-1">上昇させる能力:</label>
              <select
                id="quark-stat-defender"
                // ▼▼▼ defenderState オブジェクトから参照するように修正 ▼▼▼
                value={defenderState.quarkDriveBoostedStat ?? ''}
                onChange={(e) => setDefenderState({ quarkDriveBoostedStat: e.target.value ? (e.target.value as ProtosynthesisBoostTarget) : undefined })}
                disabled={!selectedPokemon}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
              >
                <option value="">選択してください</option>
                {boostableStats.map(stat => (
                  <option key={stat.value || 'none'} value={stat.value || ''}>{stat.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {showDefender2 && selectedPokemon && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">防御側 2体目用</h3>
          <div className="text-sm text-white mb-2">{selectedPokemon.name}</div>
          <div className="flex items-center gap-3 mb-3">
            <img src={getPokemonIconPath(selectedPokemon.id)} alt={selectedPokemon.name} className="w-8 h-8" />
            <div className="flex flex-col">
              <div className="flex gap-1">
                {currentTypes[0] && <span className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getTypeColor(currentTypes[0]) }}>{getTypeNameJp(currentTypes[0])}</span>}
                {currentTypes[1] && <span className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getTypeColor(currentTypes[1]) }}>{getTypeNameJp(currentTypes[1])}</span>}
                {(!currentTypes[0] && !currentTypes[1]) && <span className="text-xs text-gray-400">タイプなし</span>}
              </div>
              <div className="text-sm font-mono text-gray-300 mt-1">H{selectedPokemon.baseStats.hp} A{selectedPokemon.baseStats.attack} B{selectedPokemon.baseStats.defense} C{selectedPokemon.baseStats.specialAttack} D{selectedPokemon.baseStats.specialDefense} S{selectedPokemon.baseStats.speed}</div>
            </div>
          </div>
          {defenderIsTerastallized && <div className="mt-2 text-sm text-yellow-400">(防御側1のテラスタル状態を共有)</div>}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 bg-slate-700 rounded-lg mt-1.5 mb-1.5 shadow">
            <span className="text-sm font-medium text-gray-300 whitespace-nowrap pl-1 w-20">持ち物</span>
            <div className="w-full"><ItemSelect items={items} selected={defender2Item} onChange={setDefender2Item} label="" side="defender" disabled={!selectedPokemon} /></div>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 bg-slate-700 rounded-lg mt-1.5 mb-1.5 shadow">
            <span className="text-sm font-medium text-gray-300 whitespace-nowrap pl-1 w-20">特性</span>
            <div className="w-full"><AbilitySelect abilities={abilities} selected={defender2Ability} onChange={setDefender2Ability} label="" side="defender" selectedPokemon={selectedPokemon} disabled={!selectedPokemon} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">※ 防御側2の能力値・ランク・バトル状態は防御側1と共通です。</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1"><label htmlFor="hp-input-defender" className="text-white font-medium">HP</label><input id="hp-input-defender" type="number" inputMode="numeric" pattern="[0-9]*" value={hpInputValue} onChange={handleHpInputChange} onBlur={handleHpInputBlur} className="w-24 bg-gray-700 text-white text-center p-1 rounded-md text-lg" disabled={!selectedPokemon} min="0" /></div>
            <StatSlider label="ステータスポイント" value={hpStat.statPoints} onChange={handleHpEvChangeDirect} max={32} currentStat={hpBaseValueForDisplay} disabled={!selectedPokemon} />
            <div className="flex justify-end items-start mt-2"><div className="text-right"><span className="text-sm text-gray-400">ステータスポイント: {hpStat.statPoints}</span><div className="flex gap-1 mt-1 justify-end"><button onClick={() => handleHpEvChangeDirect(0)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>0</button><button onClick={() => handleHpEvChangeDirect(32)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>32</button></div></div></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1"><label htmlFor="def-input-defender" className="text-white font-medium">ぼうぎょ</label><input id="def-input-defender" type="number" inputMode="numeric" pattern="[0-9]*" value={defenseInputValue} onChange={handleDefenseInputChange} onBlur={handleDefenseInputBlur} className="w-24 bg-gray-700 text-white text-center p-1 rounded-md text-lg" disabled={!selectedPokemon} min="0" /></div>
            <StatSlider label="ステータスポイント" value={defenseStat.statPoints} onChange={handleDefenseEvChangeDirect} max={32} currentStat={defenseBaseValueForDisplay} disabled={!selectedPokemon} />
            <div className="flex justify-between items-start mt-2">
              <div><label className="text-sm text-gray-400">性格補正</label><div className="flex gap-1 mt-1">{[0.9, 1.0, 1.1].map((n) => (<button key={n} onClick={() => handleDefenseNatureChangeDirect(n as NatureModifier)} className={`px-3 py-1 text-xs rounded-md transition-colors ${defenseStat.nature === n ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-600 hover:bg-gray-500'}`} disabled={!selectedPokemon}>x{n.toFixed(1)}</button>))}</div></div>
              <div className="text-right"><span className="text-sm text-gray-400">ステータスポイント: {defenseStat.statPoints}</span><div className="flex gap-1 mt-1 justify-end"><button onClick={() => handleDefenseEvChangeDirect(0)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>0</button><button onClick={() => handleDefenseEvChangeDirect(32)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>32</button></div></div>
            </div>
            <div className="mt-4"><RankSelector value={defenseStat.rank} onChange={handleDefenseRankChangeDirect} label="ぼうぎょランク" disabled={!selectedPokemon} /></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1"><label htmlFor="spd-input-defender" className="text-white font-medium">とくぼう</label><input id="spd-input-defender" type="number" inputMode="numeric" pattern="[0-9]*" value={specialDefenseInputValue} onChange={handleSpecialDefenseInputChange} onBlur={handleSpecialDefenseInputBlur} className="w-24 bg-gray-700 text-white text-center p-1 rounded-md text-lg" disabled={!selectedPokemon} min="0" /></div>
            <StatSlider label="ステータスポイント" value={specialDefenseStat.statPoints} onChange={handleSpecialDefenseEvChangeDirect} max={32} currentStat={specialDefenseBaseValueForDisplay} disabled={!selectedPokemon} />
            <div className="flex justify-between items-start mt-2">
              <div><label className="text-sm text-gray-400">性格補正</label><div className="flex gap-1 mt-1">{[0.9, 1.0, 1.1].map((n) => (<button key={n} onClick={() => handleSpecialDefenseNatureChangeDirect(n as NatureModifier)} className={`px-3 py-1 text-xs rounded-md transition-colors ${specialDefenseStat.nature === n ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-600 hover:bg-gray-500'}`} disabled={!selectedPokemon}>x{n.toFixed(1)}</button>))}</div></div>
              <div className="text-right"><span className="text-sm text-gray-400">ステータスポイント: {specialDefenseStat.statPoints}</span><div className="flex gap-1 mt-1 justify-end"><button onClick={() => handleSpecialDefenseEvChangeDirect(0)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>0</button><button onClick={() => handleSpecialDefenseEvChangeDirect(32)} className="w-12 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 transition-colors" disabled={!selectedPokemon}>32</button></div></div>
            </div>
            <div className="mt-4"><RankSelector value={specialDefenseStat.rank} onChange={handleSpecialDefenseRankChangeDirect} label="とくぼうランク" disabled={!selectedPokemon} /></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2"><input type="checkbox" id="reflect" checked={hasReflect} onChange={(e) => setHasReflect(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /><label htmlFor="reflect" className="text-sm text-white">リフレクター</label></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="lightScreen" checked={hasLightScreen} onChange={(e) => setHasLightScreen(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /><label htmlFor="lightScreen" className="text-sm text-white">ひかりのかべ</label></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="friendGuard" checked={hasFriendGuard} onChange={(e) => setHasFriendGuard(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" /><label htmlFor="friendGuard" className="text-sm text-white">フレンドガード</label></div>
        </div>
      </div>
    </div>
  );
};

export default DefenderPanel;