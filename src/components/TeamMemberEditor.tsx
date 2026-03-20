import React, { useState, useEffect } from 'react';
import { Pokemon, Move, Item, Ability, PokemonType, Nature } from '../types';
import { X, Save, ClipboardCopy } from 'lucide-react';
import Select from 'react-select';
import StatBar from './StatBar';
import { POKEMON_TYPE_NAMES_JP } from '../calculation/pokemonTypesJp';

interface TeamMember {
  id: string;
  pokemon: Pokemon;
  level: number;
  item: Item | null;
  ability: Ability | null;
  teraType: PokemonType;
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

const PokemonTypeOptions = (Object.keys(POKEMON_TYPE_NAMES_JP) as PokemonType[]).map(type => ({
  value: type,
  label: POKEMON_TYPE_NAMES_JP[type]
}));

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
    return Math.floor(base + 20 + statPoints);
  } else {
    const rawStat = Math.floor(base + 20 + statPoints);
    return Math.floor(rawStat * natureModifier);
  }
};

const getValidStatPoint = (val: number): number => {
  return Math.max(0, Math.min(Math.round(val), 32));
};

const getValidStatPointFloor = (limit: number): number => {
  return Math.max(0, Math.min(Math.floor(limit), 32));
};


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
          : (newPokemon.types.includes(prev.teraType) ? prev.teraType : newPokemon.types[0] || prev.teraType),
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

  const getTotalStatPoints = (): number => {
    return Object.values(editedMember.statPoints).reduce((sum, val) => sum + val, 0);
  };

  const handleStatPointChange = (stat: keyof TeamMember['statPoints'], requestedRawValue: number) => {
    const currentPointForStat = editedMember.statPoints[stat];
    const totalCurrentPoints = getTotalStatPoints();
    const otherPointsSum = totalCurrentPoints - currentPointForStat;

    const budgetForThisStat = 66 - otherPointsSum;

    let targetPoint = Math.min(requestedRawValue, 32, budgetForThisStat);
    targetPoint = Math.max(0, targetPoint);

    let finalPoint = getValidStatPoint(targetPoint);

    if (finalPoint > budgetForThisStat) {
      finalPoint = getValidStatPointFloor(budgetForThisStat);
    }

    if (requestedRawValue < currentPointForStat && finalPoint > requestedRawValue) {
        finalPoint = getValidStatPointFloor(targetPoint);
    }

    if (finalPoint !== currentPointForStat) {
      setEditedMember(prev => ({
        ...prev,
        statPoints: {
          ...prev.statPoints,
          [stat]: finalPoint,
        },
      }));
    } else if (requestedRawValue === 0 && currentPointForStat !== 0 && finalPoint === 0) {
       setEditedMember(prev => ({
        ...prev,
        statPoints: {
          ...prev.statPoints,
          [stat]: 0,
        },
      }));
    }
  };

  const getStatLabelWithNature = (statKey: keyof TeamMember['statPoints'], nature: Nature | null): { label: string; color: string } => {
    let label = baseStatLabels[statKey];
    let color = 'text-gray-300';
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
      hp: 'HP', attack: 'Atk', defense: 'Def',
      specialAttack: 'SpA', specialDefense: 'SpD', speed: 'Spe'
    };

    const lines: string[] = [];

    let line1 = pokemon.nameEn || pokemon.name;
    if (item) {
      line1 += ` @ ${item.nameEn || item.name}`;
    }
    lines.push(line1);

    if (ability) {
      lines.push(`Ability: ${ability.nameEn || ability.name}`);
    }
    lines.push(`Level: ${level}`);
    lines.push(`Tera Type: ${capitalize(teraType)}`);

    const statPointStrings: string[] = [];
    statOrder.forEach(stat => {
      if (statPoints[stat] > 0) {
        statPointStrings.push(`${statPoints[stat]} ${statShorthands[stat]}`);
      }
    });
    if (statPointStrings.length > 0) {
      lines.push(`EVs: ${statPointStrings.join(' / ')}`);
    }

    if (nature) {
      lines.push(`${capitalize(nature.nameEn || nature.name)} Nature`);
    }

    memberMoves.forEach(move => {
      if (move) {
        lines.push(`- ${move.nameEn || move.name}`);
      }
    });

    const textToCopy = lines.join('\n');
    navigator.clipboard.writeText(textToCopy)
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      });
  };


  const pokemonOptions = allPokemon.map(p => ({ value: p.id, label: p.name }));
  const itemOptions = allItems.map(i => ({ value: i.nameEn, label: i.name }));
  const pokemonAbilityNames = editedMember.pokemon.abilities || [];
  const filteredAbilityObjects = allAbilities.filter(ability => ability.nameEn && pokemonAbilityNames.includes(ability.nameEn));
  const abilityOptions = filteredAbilityObjects.map(a => ({ value: a.nameEn, label: a.name }));
  const natureOptions = allNatures.map(n => ({ value: n.name, label: n.name_jp || n.name }));
  const moveOptions = allMoves.map(m => ({ value: m.nameEn, label: m.name }));

  const totalStatPoints = getTotalStatPoints();
  const remainingPoints = 66 - totalStatPoints;

  const selectStyles = {
    control: (base: any) => ({ ...base, backgroundColor: '#374151', borderColor: '#4B5563', color: 'white', minHeight: '30px', height: '30px', boxShadow: 'none', '&:hover': { borderColor: '#6B7280' } }),
    singleValue: (base: any) => ({ ...base, color: 'white', fontSize: '0.75rem' }),
    input: (base: any) => ({ ...base, color: 'white', margin: '0', padding: '0 2px', fontSize: '0.75rem' }),
    placeholder: (base: any) => ({ ...base, color: '#9CA3AF', fontSize: '0.75rem' }),
    menu: (base: any) => ({ ...base, backgroundColor: '#374151', zIndex: 20 }),
    option: (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? '#4B5563' : '#374151', color: 'white', padding: '4px 8px', fontSize: '0.75rem'}),
    valueContainer: (base: any) => ({ ...base, padding: '0 6px', height: '30px' }),
    indicatorsContainer: (base: any) => ({ ...base, height: '30px', padding: '0 4px'}),
    dropdownIndicator: (base: any) => ({ ...base, padding: '4px'}),
    clearIndicator: (base: any) => ({ ...base, padding: '4px'}),
  };


  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto relative text-[12px]">
        {/* モーダルヘッダー */}
        <div className="flex justify-between items-center mb-1 sticky top-0 bg-gray-800 py-1 -mx-1 sm:-mx-1 px-1 sm:px-1 border-b border-gray-700 z-10">
          <h6 className="text-lg font-semibold text-white">ポケモン編集</h6>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ポケモン、レベル */}
        <div className="grid grid-cols-[1fr_70px] gap-x-1 mb-1 px-1">
          <div>
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">ポケモン</label>
            <Select
              classNamePrefix="react-select"
              options={pokemonOptions}
              value={pokemonOptions.find(opt => opt.value === editedMember.pokemon.id)}
              onChange={handlePokemonChange}
              placeholder="ポケモン"
              isClearable={false}
              styles={selectStyles}
              filterOption={customSelectFilter}
            />
          </div>
          <div>
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">レベル</label>
            <input type="number" value={editedMember.level} onChange={(e) => setEditedMember(prev => ({ ...prev, level: Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)) }))} className="w-full px-1.5 py-0 h-[30px] bg-gray-700 border border-gray-600 rounded text-white text-[11px] focus:ring-blue-500 focus:border-blue-500 text-center" min="1" max="100"/>
          </div>
        </div>
        {/* わざ */}
        <div className="mb-1 px-1">
          <label className="block text-gray-300 text-[10px] font-bold mb-0.5">わざ</label>
          <div className="space-y-1">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <Select
                  classNamePrefix="react-select"
                  options={moveOptions}
                  value={editedMember.moves[index] ? moveOptions.find(opt => opt.value === editedMember.moves[index]?.nameEn) : null}
                  onChange={(selectedOption) => handleMoveChange(index, selectedOption)}
                  isClearable
                  placeholder={`わざ${index + 1}`}
                  styles={selectStyles}
                  filterOption={customSelectFilter}
                />
              </div>
            ))}
          </div>
        </div>
        {/* 持ち物、とくせい */}
        <div className="grid grid-cols-2 gap-x-1.5 mb-1 px-1">
          <div>
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">持ち物</label>
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
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">とくせい</label>
            <Select
              classNamePrefix="react-select"
              options={abilityOptions}
              value={editedMember.ability ? abilityOptions.find(opt => opt.value === editedMember.ability?.nameEn) : null}
              onChange={handleAbilityChange}
              isClearable
              placeholder={abilityOptions.length === 0 ? "選択不可" : "なし"}
              isDisabled={abilityOptions.length === 0}
              styles={selectStyles}
              filterOption={customSelectFilter}
            />
          </div>
        </div>
        {/* テラス、性格 */}
        <div className="grid grid-cols-2 gap-x-1.5 mb-2 px-1">
          <div>
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">テラス</label>
            <Select
              classNamePrefix="react-select"
              options={PokemonTypeOptions}
              value={PokemonTypeOptions.find(opt => opt.value === editedMember.teraType)}
              onChange={handleTeraTypeChange}
              placeholder="テラスタイプ"
              styles={selectStyles}
              filterOption={customSelectFilter}
            />
          </div>
          <div>
            <label className="block text-gray-300 text-[10px] font-bold mb-0.5">性格</label>
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
        </div>

        {/* ──────── ステータスポイントセクション ──────── */}
        <div className="mb-2 px-1">
          {/* ヘッダー行 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">ステータスポイント</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${remainingPoints > 0 ? 'bg-blue-900 text-blue-200' : remainingPoints === 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                残 {remainingPoints} / 66
              </span>
              <button
                onClick={() => setEditedMember(prev => ({ ...prev, statPoints: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } }))}
                className="text-[10px] px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                全リセット
              </button>
            </div>
          </div>

          {/* ステータス行 */}
          <div className="space-y-3">
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
              if (remainingPoints <= 0 && pointsValue === 0) {
                  actualMaxValueForSlider = 0;
              } else if (remainingPoints <= 0) {
                  actualMaxValueForSlider = pointsValue;
              } else {
                  actualMaxValueForSlider = Math.min(32, pointsValue + remainingPoints);
              }

              const { label, color } = getStatLabelWithNature(stat, editedMember.nature);
              const barColor = statBarColors[stat];

              return (
                <div key={stat} className="space-y-1.5">
                  {/* ラベル行: H↑ / ポイント数値入力 / 実値 / クイックボタン */}
                  <div className="flex items-center gap-2">
                    <span className={`w-6 text-center text-xs font-bold shrink-0 ${color}`}>
                      {label}
                    </span>
                    {/* 数値入力 */}
                    <input
                      type="number"
                      value={pointsValue}
                      onChange={(e) => handleStatPointChange(stat, parseInt(e.target.value, 10) || 0)}
                      className="w-10 px-1 py-0.5 h-6 bg-gray-700 border border-gray-600 rounded text-white text-[11px] text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 tabular-nums"
                      min="0" max="32"
                    />
                    {/* 実値 */}
                    <span className={`text-sm font-bold tabular-nums w-8 text-center ${natureModifier > 1 ? 'text-red-400' : natureModifier < 1 ? 'text-blue-400' : 'text-white'}`}>
                      {actualStat}
                    </span>
                    {/* クイックボタン */}
                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => handleStatPointChange(stat, 0)}
                        disabled={pointsValue === 0}
                        className="text-[10px] w-6 h-6 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="0にリセット"
                      >
                        0
                      </button>
                      <button
                        onClick={() => handleStatPointChange(stat, actualMaxValueForSlider)}
                        disabled={pointsValue >= actualMaxValueForSlider}
                        className={`text-[10px] w-6 h-6 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${barColor.replace('bg-', 'bg-').replace('-500', '-700')} hover:opacity-80 text-white`}
                        title="最大まで振る"
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                  {/* カスタムスライダー */}
                  <StatBar
                    value={pointsValue}
                    fixedMax={32}
                    actualMaxValue={actualMaxValueForSlider}
                    onChange={(v) => handleStatPointChange(stat, v)}
                    barColor={barColor}
                    limitColor={barColor.replace('-500', '-900')}
                    disabled={actualMaxValueForSlider === 0 && pointsValue === 0}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 保存・キャンセル・コピーボタン */}
        <div className="flex justify-end sticky bottom-0 gap-3 bg-gray-800 py-1 -mx-1 sm:-mx-1 px-1 sm:px-1 border-t border-gray-700 z-10">
          <button
            onClick={handleCopyToClipboardCurrentMember}
            className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-[11px] font-medium"
            title="現在の情報をShowdown形式でコピー"
          >
            <ClipboardCopy className="h-3.5 w-3.5" /> コピー
          </button>
          <button onClick={() => onSave(editedMember)} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium" disabled={remainingPoints < 0}>
            <Save className="h-3.5 w-3.5" /> 保存
          </button>
          <button onClick={onClose} className="flex items-center gap-1 px-2.5 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-[11px] font-medium">
            <X className="h-3.5 w-3.5" /> キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberEditor;