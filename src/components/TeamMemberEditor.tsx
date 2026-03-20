import React, { useState, useEffect } from 'react';
import { Pokemon, Move, Item, Ability, PokemonType, Nature } from '../types';
import { X, Save, ClipboardCopy, ChevronDown, ChevronUp } from 'lucide-react';
import Select from 'react-select';
import StatBar from './StatBar';
import { POKEMON_TYPE_NAMES_JP } from '../calculation/pokemonTypesJp';

interface TeamMember {
  id: string;
  pokemon: Pokemon;
  level: number;
  item: Item | null;
  ability: Ability | null;
  teraType: PokemonType | 'none';
  nature: Nature | null;
  statPoints: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  moves: (Move | null)[];
}

interface TeamMemberEditorProps {
  member: TeamMember;
  allPokemon: Pokemon[];
  allMoves: Move[];
  allItems: Item[];
  allAbilities: Ability[];
  allNatures: Nature[];
  onSave: (updatedMember: TeamMember) => void;
  onClose: () => void;
}

// ひらがなをカタカナに変換する関数
const hiraganaToKatakana = (str: string): string => {
  if (!str) return '';
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const charCode = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(charCode);
  });
};

const customSelectFilter = (
  option: { label: string; value: any; data?: any },
  rawInput: string
): boolean => {
  const inputValue = rawInput.trim();
  if (!inputValue) return true;
  const katakanaInputValue = hiraganaToKatakana(inputValue).toLowerCase();
  const katakanaOptionLabel = hiraganaToKatakana(option.label).toLowerCase();
  return katakanaOptionLabel.includes(katakanaInputValue);
};

const PokemonTypeOptions = [
  { value: 'none', label: 'なし' },
  ...(Object.keys(POKEMON_TYPE_NAMES_JP) as PokemonType[]).map(type => ({
    value: type,
    label: POKEMON_TYPE_NAMES_JP[type]
  }))
];

const statKeys: (keyof TeamMember['statPoints'])[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

const baseStatLabels: Record<keyof TeamMember['statPoints'], string> = {
  hp: 'H',
  attack: 'A',
  defense: 'B',
  specialAttack: 'C',
  specialDefense: 'D',
  speed: 'S',
};

const statBarColors: Record<keyof TeamMember['statPoints'], string> = {
  hp: 'bg-green-500',
  attack: 'bg-red-500',
  defense: 'bg-yellow-500',
  specialAttack: 'bg-blue-500',
  specialDefense: 'bg-teal-500',
  speed: 'bg-purple-500',
};

// バー色 → ボタン/バッジ色への変換
const statAccentColors: Record<keyof TeamMember['statPoints'], string> = {
  hp: 'bg-green-700 hover:bg-green-600',
  attack: 'bg-red-700 hover:bg-red-600',
  defense: 'bg-yellow-700 hover:bg-yellow-600',
  specialAttack: 'bg-blue-700 hover:bg-blue-600',
  specialDefense: 'bg-teal-700 hover:bg-teal-600',
  speed: 'bg-purple-700 hover:bg-purple-600',
};

const capitalize = (s: string) => {
  if (typeof s !== 'string' || s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const calculateStat = (
  base: number,
  statPoints: number,
  natureModifier: number,
  statName: keyof TeamMember['statPoints']
): number => {
  if (statName === 'hp') {
    if (base === 1) return 1; // ヌケニン対応
    return Math.floor(base + 75 + statPoints);
  } else {
    const rawStat = Math.floor(base + 20 + statPoints);
    return Math.floor(rawStat * natureModifier);
  }
};

const getValidStatPoint = (val: number): number => Math.max(0, Math.min(Math.round(val), 32));
const getValidStatPointFloor = (limit: number): number => Math.max(0, Math.min(Math.floor(limit), 32));

// ─── react-select スタイル（モバイルファースト: 高さ 44px） ───
const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: '#1e2433',
    borderColor: '#374151',
    color: 'white',
    minHeight: '44px',
    boxShadow: 'none',
    borderRadius: '10px',
    '&:hover': { borderColor: '#6B7280' },
  }),
  singleValue: (base: any) => ({ ...base, color: 'white', fontSize: '0.875rem' }),
  input: (base: any) => ({ ...base, color: 'white', margin: '0', padding: '0 2px', fontSize: '0.875rem' }),
  placeholder: (base: any) => ({ ...base, color: '#6B7280', fontSize: '0.875rem' }),
  menu: (base: any) => ({ ...base, backgroundColor: '#1e2433', zIndex: 50, borderRadius: '10px' }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? '#374151' : '#1e2433',
    color: 'white',
    padding: '10px 12px',
    fontSize: '0.875rem',
  }),
  valueContainer: (base: any) => ({ ...base, padding: '0 12px' }),
  indicatorsContainer: (base: any) => ({ ...base, padding: '0 4px' }),
  dropdownIndicator: (base: any) => ({ ...base, padding: '8px', color: '#6B7280' }),
  clearIndicator: (base: any) => ({ ...base, padding: '8px', color: '#6B7280' }),
};

// ─── メインコンポーネント ───
const TeamMemberEditor: React.FC<TeamMemberEditorProps> = ({
  member,
  allPokemon,
  allMoves,
  allItems,
  allAbilities,
  allNatures,
  onSave,
  onClose,
}) => {
  const [editedMember, setEditedMember] = useState<TeamMember>(member);

  useEffect(() => {
    setEditedMember(member);
  }, [member]);

  // ─── ハンドラ（ロジック変更なし） ───
  const handlePokemonChange = (selectedOption: any) => {
    const newPokemon = allPokemon.find(p => p.id === selectedOption.value);
    if (newPokemon) {
      const currentAbilityNameEn = editedMember.ability?.nameEn;
      const newPokemonAvailableAbilities = newPokemon.abilities || [];
      let newAbility = editedMember.ability;
      if (currentAbilityNameEn && !newPokemonAvailableAbilities.includes(currentAbilityNameEn)) {
        newAbility = null;
      }
      const pokemonAbilities = allAbilities.filter(ability => ability.nameEn && newPokemon.abilities.includes(ability.nameEn));
      if (pokemonAbilities.length === 1) {
        newAbility = pokemonAbilities[0];
      }
      setEditedMember(prev => ({
        ...prev,
        pokemon: newPokemon,
        ability: newAbility,
        teraType: (prev.teraType === prev.pokemon.types[0] && newPokemon.types.length > 0)
          ? newPokemon.types[0]
          : (prev.teraType === 'none' ? 'none' : (newPokemon.types.includes(prev.teraType as PokemonType) ? prev.teraType : newPokemon.types[0] || prev.teraType)),
      }));
    }
  };

  const handleItemChange = (selectedOption: any) => {
    const newItem = selectedOption ? allItems.find(i => i.nameEn === selectedOption.value) || null : null;
    setEditedMember(prev => ({ ...prev, item: newItem }));
  };
  const handleAbilityChange = (selectedOption: any) => {
    const newAbility = selectedOption ? allAbilities.find(a => a.nameEn === selectedOption.value) || null : null;
    setEditedMember(prev => ({ ...prev, ability: newAbility }));
  };
  const handleNatureChange = (selectedOption: any) => {
    const newNature = selectedOption ? allNatures.find(n => n.name === selectedOption.value) || null : null;
    setEditedMember(prev => ({ ...prev, nature: newNature }));
  };
  const handleTeraTypeChange = (selectedOption: any) => {
    setEditedMember(prev => ({ ...prev, teraType: selectedOption.value }));
  };
  const handleMoveChange = (index: number, selectedOption: any) => {
    const newMove = selectedOption ? allMoves.find(m => m.nameEn === selectedOption.value) || null : null;
    setEditedMember(prev => {
      const newMoves = [...prev.moves];
      newMoves[index] = newMove;
      return { ...prev, moves: newMoves };
    });
  };

  const getTotalStatPoints = (): number =>
    Object.values(editedMember.statPoints).reduce((sum, val) => sum + val, 0);

  const handleStatPointChange = (stat: keyof TeamMember['statPoints'], requestedRawValue: number) => {
    const currentPointForStat = editedMember.statPoints[stat];
    const totalCurrentPoints = getTotalStatPoints();
    const otherPointsSum = totalCurrentPoints - currentPointForStat;
    const budgetForThisStat = 66 - otherPointsSum;

    let targetPoint = Math.min(requestedRawValue, 32, budgetForThisStat);
    targetPoint = Math.max(0, targetPoint);
    let finalPoint = getValidStatPoint(targetPoint);
    if (finalPoint > budgetForThisStat) finalPoint = getValidStatPointFloor(budgetForThisStat);
    if (requestedRawValue < currentPointForStat && finalPoint > requestedRawValue) {
      finalPoint = getValidStatPointFloor(targetPoint);
    }

    if (finalPoint !== currentPointForStat) {
      setEditedMember(prev => ({ ...prev, statPoints: { ...prev.statPoints, [stat]: finalPoint } }));
    } else if (requestedRawValue === 0 && currentPointForStat !== 0 && finalPoint === 0) {
      setEditedMember(prev => ({ ...prev, statPoints: { ...prev.statPoints, [stat]: 0 } }));
    }
  };

  const getStatLabelWithNature = (statKey: keyof TeamMember['statPoints'], nature: Nature | null): { label: string; color: string } => {
    let label = baseStatLabels[statKey];
    let color = 'text-gray-400';
    if (nature) {
      if (nature.increasedStat === statKey) { label += '↑'; color = 'text-red-400'; }
      if (nature.decreasedStat === statKey) { label += '↓'; color = 'text-blue-400'; }
    }
    return { label, color };
  };

  const handleCopyToClipboardCurrentMember = () => {
    const { pokemon, item, ability, level, teraType, statPoints, nature, moves: memberMoves } = editedMember;
    const statOrder: (keyof TeamMember['statPoints'])[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    const statShorthands: { [key in keyof TeamMember['statPoints']]: string } = {
      hp: 'HP', attack: 'Atk', defense: 'Def', specialAttack: 'SpA', specialDefense: 'SpD', speed: 'Spe'
    };
    const lines: string[] = [];
    let line1 = pokemon.nameEn || pokemon.name;
    if (item) line1 += ` @ ${item.nameEn || item.name}`;
    lines.push(line1);
    if (ability) lines.push(`Ability: ${ability.nameEn || ability.name}`);
    lines.push(`Level: ${level}`);
    if (teraType && teraType !== 'none') lines.push(`Tera Type: ${capitalize(teraType)}`);
    const statPointStrings: string[] = [];
    statOrder.forEach(stat => {
      if (statPoints[stat] > 0) statPointStrings.push(`${statPoints[stat]} ${statShorthands[stat]}`);
    });
    if (statPointStrings.length > 0) lines.push(`EVs: ${statPointStrings.join(' / ')}`);
    if (nature) lines.push(`${capitalize(nature.nameEn || nature.name)} Nature`);
    memberMoves.forEach(move => { if (move) lines.push(`- ${move.nameEn || move.name}`); });
    navigator.clipboard.writeText(lines.join('\n'))
      .catch(err => { console.error('クリップボードへのコピーに失敗しました:', err); alert('クリップボードへのコピーに失敗しました。'); });
  };

  // ─── オプション ───
  const pokemonOptions = allPokemon.map(p => ({ value: p.id, label: p.name }));
  const itemOptions = allItems.map(i => ({ value: i.nameEn, label: i.name }));
  const pokemonAbilityNames = editedMember.pokemon.abilities || [];
  const filteredAbilityObjects = allAbilities.filter(ability => ability.nameEn && pokemonAbilityNames.includes(ability.nameEn));
  const abilityOptions = filteredAbilityObjects.map(a => ({ value: a.nameEn, label: a.name }));
  const natureOptions = allNatures.map(n => ({ value: n.name, label: n.name_jp || n.name }));
  const moveOptions = allMoves.map(m => ({ value: m.nameEn, label: m.name }));

  const totalStatPoints = getTotalStatPoints();
  const remainingPoints = 66 - totalStatPoints;

  // ─── JSX ───
  return (
    /* オーバーレイ */
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60" onClick={onClose}>
      {/* ドロワー本体 — クリックがオーバーレイに伝播しないよう止める */}
      <div
        className="relative mt-auto flex flex-col w-full max-w-lg mx-auto rounded-t-2xl overflow-hidden"
        style={{
          maxHeight: '100dvh',
          background: 'linear-gradient(180deg, #141821 0%, #0f1318 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ════════════════ 固定ヘッダー ════════════════ */}
        <div
          className="flex-shrink-0 flex items-center px-4 py-3 border-b border-white/10"
          style={{ background: 'rgba(20,24,33,0.98)', backdropFilter: 'blur(12px)' }}
        >
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 transition-colors text-gray-400 hover:text-white mr-3 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ポケモン名 */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 leading-none mb-0.5">編集中</p>
            <h2 className="text-base font-bold text-white truncate leading-tight">
              {editedMember.pokemon.name}
            </h2>
          </div>

          {/* サブアクション: コピー */}
          <button
            onClick={handleCopyToClipboardCurrentMember}
            title="Showdown形式でコピー"
            className="flex items-center gap-1.5 ml-2 px-3 h-9 rounded-lg bg-amber-600/20 hover:bg-amber-600/35 text-amber-300 text-xs font-medium transition-colors flex-shrink-0"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            コピー
          </button>
        </div>

        {/* ════════════════ スクロール可能メインコンテンツ ════════════════ */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-2 space-y-5">

          {/* ── ポケモン選択 + レベル ── */}
          <section>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">ポケモン</label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 min-w-0">
                <Select
                  classNamePrefix="react-select"
                  options={pokemonOptions}
                  value={pokemonOptions.find(opt => opt.value === editedMember.pokemon.id)}
                  onChange={handlePokemonChange}
                  placeholder="ポケモンを選択"
                  isClearable={false}
                  styles={selectStyles}
                  filterOption={customSelectFilter}
                />
              </div>
              <div className="flex-shrink-0 w-20">
                <input
                  type="number"
                  value={editedMember.level}
                  onChange={e => setEditedMember(prev => ({ ...prev, level: Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)) }))}
                  className="w-full h-11 px-2 rounded-[10px] bg-[#1e2433] border border-[#374151] text-white text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1" max="100"
                  placeholder="Lv."
                />
              </div>
            </div>
          </section>

          {/* ── わざ ── */}
          <section>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">わざ</label>
            <div className="grid grid-cols-1 gap-2">
              {[0, 1, 2, 3].map(index => (
                <Select
                  key={index}
                  classNamePrefix="react-select"
                  options={moveOptions}
                  value={editedMember.moves[index] ? moveOptions.find(opt => opt.value === editedMember.moves[index]?.nameEn) : null}
                  onChange={selectedOption => handleMoveChange(index, selectedOption)}
                  isClearable
                  placeholder={`わざ ${index + 1}`}
                  styles={selectStyles}
                  filterOption={customSelectFilter}
                />
              ))}
            </div>
          </section>

          {/* ── 持ち物 + 特性 ── */}
          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">持ち物</label>
              <Select
                classNamePrefix="react-select"
                options={itemOptions}
                value={editedMember.item ? itemOptions.find(opt => opt.value === editedMember.item?.nameEn) : null}
                onChange={handleItemChange}
                isClearable
                placeholder="なし"
                styles={selectStyles}
                filterOption={customSelectFilter}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">とくせい</label>
              <Select
                classNamePrefix="react-select"
                options={abilityOptions}
                value={editedMember.ability ? abilityOptions.find(opt => opt.value === editedMember.ability?.nameEn) : null}
                onChange={handleAbilityChange}
                isClearable
                placeholder={abilityOptions.length === 0 ? '—' : 'なし'}
                isDisabled={abilityOptions.length === 0}
                styles={selectStyles}
                filterOption={customSelectFilter}
              />
            </div>
          </section>

          {/* ── テラス + 性格 ── */}
          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">テラスタル</label>
              <Select
                classNamePrefix="react-select"
                options={PokemonTypeOptions}
                value={PokemonTypeOptions.find(opt => opt.value === editedMember.teraType)}
                onChange={handleTeraTypeChange}
                placeholder="タイプ"
                styles={selectStyles}
                filterOption={customSelectFilter}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">性格</label>
              <Select
                classNamePrefix="react-select"
                options={natureOptions}
                value={editedMember.nature ? natureOptions.find(opt => opt.value === editedMember.nature?.name) : null}
                onChange={handleNatureChange}
                isClearable
                placeholder="なし"
                styles={selectStyles}
                filterOption={customSelectFilter}
              />
            </div>
          </section>

          {/* ── ステータスポイント ── */}
          <section>
            {/* セクションヘッダー */}
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ステータスポイント</label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  remainingPoints > 0 ? 'bg-blue-900/60 text-blue-300' :
                  remainingPoints === 0 ? 'bg-green-900/60 text-green-300' :
                  'bg-red-900/60 text-red-300'
                }`}>
                  残 {remainingPoints} / 66
                </span>
                <button
                  onClick={() => setEditedMember(prev => ({
                    ...prev,
                    statPoints: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
                  }))}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                >
                  全リセット
                </button>
              </div>
            </div>

            {/* 各ステータス行 */}
            <div className="space-y-4">
              {statKeys.map(stat => {
                const baseStatValue = editedMember.pokemon.baseStats?.[stat] || 50;
                const pointsValue = editedMember.statPoints[stat];
                let natureModifier = 1.0;
                if (editedMember.nature) {
                  if (editedMember.nature.increasedStat === stat) natureModifier = 1.1;
                  if (editedMember.nature.decreasedStat === stat) natureModifier = 0.9;
                }
                const actualStat = calculateStat(baseStatValue, pointsValue, natureModifier, stat);
                let actualMaxValueForSlider: number;
                if (remainingPoints <= 0 && pointsValue === 0) actualMaxValueForSlider = 0;
                else if (remainingPoints <= 0) actualMaxValueForSlider = pointsValue;
                else actualMaxValueForSlider = Math.min(32, pointsValue + remainingPoints);

                const { label, color } = getStatLabelWithNature(stat, editedMember.nature);
                const barColor = statBarColors[stat];
                const accentColor = statAccentColors[stat];

                return (
                  <div key={stat}>
                    {/* コントロール行 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* ラベル */}
                      <span className={`w-7 text-center text-sm font-bold shrink-0 ${color}`}>
                        {label}
                      </span>

                      {/* − ボタン */}
                      <button
                        onClick={() => handleStatPointChange(stat, pointsValue - 1)}
                        disabled={pointsValue <= 0}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 text-white text-lg font-bold transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label={`${label} を減らす`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* 数値入力 */}
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={e => handleStatPointChange(stat, parseInt(e.target.value, 10) || 0)}
                        className="w-12 h-9 rounded-lg bg-[#1e2433] border border-[#374151] text-white text-sm font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tabular-nums"
                        min="0" max="32"
                      />

                      {/* + ボタン */}
                      <button
                        onClick={() => handleStatPointChange(stat, pointsValue + 1)}
                        disabled={pointsValue >= actualMaxValueForSlider}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 text-white text-lg font-bold transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label={`${label} を増やす`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* 実数値 */}
                      <span className={`flex-1 text-right text-sm font-bold tabular-nums ${
                        natureModifier > 1 ? 'text-red-400' : natureModifier < 1 ? 'text-blue-400' : 'text-white'
                      }`}>
                        {actualStat}
                      </span>

                      {/* MAXボタン */}
                      <button
                        onClick={() => handleStatPointChange(stat, actualMaxValueForSlider)}
                        disabled={pointsValue >= actualMaxValueForSlider}
                        className={`text-[11px] px-2 h-9 rounded-lg ${accentColor} text-white font-bold transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0`}
                        title="上限まで振る"
                      >
                        MAX
                      </button>
                    </div>

                    {/* スライダー（StatBar） */}
                    <StatBar
                      value={pointsValue}
                      fixedMax={32}
                      actualMaxValue={actualMaxValueForSlider}
                      onChange={v => handleStatPointChange(stat, v)}
                      barColor={barColor}
                      limitColor={barColor.replace('-500', '-900')}
                      disabled={actualMaxValueForSlider === 0 && pointsValue === 0}
                      className="h-6"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* ボトムの余白（フッターが被らないよう） */}
          <div className="h-2" />
        </div>

        {/* ════════════════ 固定フッター ════════════════ */}
        <div
          className="flex-shrink-0 flex gap-3 px-4 pt-3"
          style={{
            background: 'rgba(14,17,24,0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
          }}
        >
          {/* キャンセル */}
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-white/8 hover:bg-white/14 text-gray-300 hover:text-white text-sm font-semibold transition-colors"
          >
            キャンセル
          </button>

          {/* 保存 */}
          <button
            onClick={() => onSave(editedMember)}
            disabled={remainingPoints < 0}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberEditor;