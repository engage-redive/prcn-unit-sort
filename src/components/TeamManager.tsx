// src/components/TeamManager.tsx

import React, { useState, useEffect } from 'react';
import { Pokemon, Move, Item, Ability, PokemonType, Nature } from '../types';
import { Plus, X, Copy as CopyIcon, UploadCloud, ArrowLeft } from 'lucide-react';
import { createTeamImage } from '../utils/teamImageRenderer';
import TeamMemberCard from '../types/TeamMemberCard'; // TeamMemberCard の型定義がここにあると仮定
import TeamMemberEditor from './TeamMemberEditor';
import { TeamMember, Team, useTeamStore } from '../stores/teamStore';
import { useAttackerStore } from '../stores/attackerStore';
import { useDefenderStore } from '../stores/defenderStore';
import { getPokemonIconPath } from '../utils/uiHelpers';

interface TeamManagerProps {
  pokemon: Pokemon[];
  moves: Move[];
  items: Item[];
  abilities: Ability[];
  natures: Nature[];
}

type View = 'list' | 'editTeam';

const capitalize = (s: string) => {
  if (typeof s !== 'string' || s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// チームメンバー1匹をShowdown形式のテキストに変換する関数
const formatTeamMemberToText = (member: TeamMember): string => {
  const { pokemon, item, ability, level, teraType, statPoints, nature, moves: memberMoves } = member;
  const statOrder: (keyof TeamMember['statPoints'])[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
  const statShorthands: { [key in keyof TeamMember['statPoints']]: string } = {
    hp: 'HP', attack: 'Atk', defense: 'Def',
    specialAttack: 'SpA', specialDefense: 'SpD', speed: 'Spe'
  };
  const lines: string[] = [];

  let line1 = pokemon.nameEn || pokemon.name; // 英語名優先、なければ日本語名
  if (item) line1 += ` @ ${item.nameEn || item.name}`;
  lines.push(line1);

  if (ability) lines.push(`Ability: ${ability.nameEn || ability.name}`);
  lines.push(`Level: ${level}`); // レベルは Showdown 形式で一般的
  if (teraType && teraType !== 'none') lines.push(`Tera Type: ${capitalize(teraType)}`);

  const statPointStrings: string[] = [];
  statOrder.forEach(stat => { if (statPoints[stat] > 0) statPointStrings.push(`${statPoints[stat]} ${statShorthands[stat]}`); });
  if (statPointStrings.length > 0) lines.push(`Stat Points: ${statPointStrings.join(' / ')}`);

  if (nature) lines.push(`${capitalize(nature.nameEn || nature.name)} Nature`);

  memberMoves.forEach(move => { if (move) lines.push(`- ${move.nameEn || move.name}`); });

  return lines.join('\n');
};


const TeamManager: React.FC<TeamManagerProps> = ({
  pokemon, moves, items, abilities, natures
}) => {
  const { teams, createTeam, deleteTeam, updateTeamName, addMemberToTeam, updateMemberInTeam, deleteMemberFromTeam } = useTeamStore();
  const { loadFromTeamMember: loadAsAttacker } = useAttackerStore();
  const { loadFromTeamMember: loadAsDefender } = useDefenderStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [isNewMember, setIsNewMember] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null); // コピー成功メッセージ用
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || null;

  useEffect(() => {
    if (useTeamStore.getState().hydrated && teams.length === 0) {
      createTeam();
    }
  }, [teams, createTeam]);

  // コピー成功メッセージを一定時間後に消す
  useEffect(() => {
    if (copySuccessMessage) {
      const timer = setTimeout(() => {
        setCopySuccessMessage(null);
      }, 2000); // 2秒後にメッセージを消す
      return () => clearTimeout(timer);
    }
  }, [copySuccessMessage]);

  const handleCreateTeam = () => {
    const newTeamId = createTeam();
    setSelectedTeamId(newTeamId);
    setCurrentView('editTeam');
  };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeamId(team.id);
    setCurrentView('editTeam');
  };

  const handleReturnToList = () => {
    setCurrentView('list');
    setSelectedTeamId(null);
  };

  const statShorthandToKey = (shorthand: string): keyof TeamMember['statPoints'] | null => {
    const map: { [key: string]: keyof TeamMember['statPoints'] } = {
      'hp': 'hp', 'atk': 'attack', 'def': 'defense', 'spa': 'specialAttack', 'spd': 'specialDefense', 'spe': 'speed',
      'attack': 'attack', 'defense': 'defense', 'sp. atk': 'specialAttack', 'special attack': 'specialAttack',
      'sp. def': 'specialDefense', 'special defense': 'specialDefense', 'speed': 'speed'
    };
    return map[shorthand.toLowerCase()] || null;
  };

  const parseSinglePokemon = (pokemonText: string): TeamMember | null => {
    const lines = pokemonText.trim().split('\n');
    let parsedPokemonNameEnOrJp: string | undefined;
    let parsedItemNameEnOrJp: string | undefined;
    let parsedAbilityNameEnOrJp: string | undefined;
    let parsedTeraType: PokemonType | undefined;
    let parsedLevel: number = 50;
    const parsedStatPoints: TeamMember['statPoints'] = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
    let parsedNatureNameEnOrJp: string | undefined;
    const parsedMoveNamesEnOrJp: string[] = [];

    lines.forEach(line => {
      const l = line.trim();
      if (l.startsWith('- ')) {
        if (parsedMoveNamesEnOrJp.length < 4) parsedMoveNamesEnOrJp.push(l.substring(2).trim());
      } else if (l.includes('@')) {
        const parts = l.split('@').map(p => p.trim());
        parsedPokemonNameEnOrJp = parts[0].replace(/\s*\([^)]*\)\s*$/, '').trim();
        if (parts.length > 1) parsedItemNameEnOrJp = parts[1];
      } else if (l.toLowerCase().startsWith('ability:')) parsedAbilityNameEnOrJp = l.substring('ability:'.length).trim();
      else if (l.toLowerCase().startsWith('tera type:')) parsedTeraType = l.substring('tera type:'.length).trim().toLowerCase() as PokemonType;
      else if (l.toLowerCase().startsWith('level:')) parsedLevel = parseInt(l.substring('level:'.length).trim(), 10) || 50;
      else if (l.toLowerCase().startsWith('evs:') || l.toLowerCase().startsWith('stat points:')) {
        const evString = l.toLowerCase().startsWith('evs:') ? l.substring('evs:'.length).trim() : l.substring('stat points:'.length).trim();
        evString.split(' / ').forEach(part => {
          const match = part.trim().match(/(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)/i);
          if (match) {
            const value = parseInt(match[1], 10);
            const statKey = statShorthandToKey(match[2]);
            if (statKey) parsedStatPoints[statKey] = value;
          }
        });
      } else if (l.toLowerCase().endsWith(' nature')) parsedNatureNameEnOrJp = l.substring(0, l.toLowerCase().indexOf(' nature')).trim();
      else if (!parsedPokemonNameEnOrJp && l.length > 0 && !l.includes(':') && !l.endsWith('Nature') && !l.includes('/') && !l.startsWith('Trait:') && !l.startsWith('Happiness:')) {
        parsedPokemonNameEnOrJp = l.replace(/\s*\([^)]*\)\s*$/, '').trim();
      }
    });

    if (!parsedPokemonNameEnOrJp) return null;

    const resolvedPokemon = pokemon.find(p => p.name.toLowerCase() === parsedPokemonNameEnOrJp!.toLowerCase() || (p.nameEn || '').toLowerCase() === parsedPokemonNameEnOrJp!.toLowerCase());
    if (!resolvedPokemon) {
      console.warn(`ポケモン "${parsedPokemonNameEnOrJp}" が見つかりません。`);
      return null;
    }

    const resolvedItem = parsedItemNameEnOrJp ? items.find(i => i.name.toLowerCase() === parsedItemNameEnOrJp!.toLowerCase() || (i.nameEn || '').toLowerCase() === parsedItemNameEnOrJp!.toLowerCase()) || null : null;
    let resolvedAbility = parsedAbilityNameEnOrJp ? abilities.find(a => a.name.toLowerCase() === parsedAbilityNameEnOrJp!.toLowerCase() || (a.nameEn || '').toLowerCase() === parsedAbilityNameEnOrJp!.toLowerCase()) || null : null;
    if (!resolvedAbility && resolvedPokemon.abilities.length > 0) {
      const firstAbilityName = resolvedPokemon.abilities[0]; // これは日本語名の場合があるので注意
      // abilitiesデータは英語名基準の場合、pokemon.abilities[0] (日本語名) から英語名を探す処理が必要になるかもしれない
      resolvedAbility = abilities.find(a => a.name.toLowerCase() === firstAbilityName.toLowerCase() || (a.nameEn || '').toLowerCase() === firstAbilityName.toLowerCase()) || null;
    }
    const resolvedNature = parsedNatureNameEnOrJp ? natures.find(n => n.name.toLowerCase() === parsedNatureNameEnOrJp!.toLowerCase() || (n.nameEn || '').toLowerCase() === parsedNatureNameEnOrJp!.toLowerCase()) || null : null;
    const resolvedMoves = parsedMoveNamesEnOrJp.map(name => moves.find(m => m.name.toLowerCase() === name.toLowerCase() || (m.nameEn || '').toLowerCase() === name.toLowerCase()) || null);
    while (resolvedMoves.length < 4) resolvedMoves.push(null);
    if (!parsedTeraType && resolvedPokemon.types.length > 0) parsedTeraType = resolvedPokemon.types[0];
    else if (!parsedTeraType) parsedTeraType = 'normal'; // デフォルトフォールバック

    return { id: `${Date.now()}-${Math.random()}`, pokemon: resolvedPokemon, level: parsedLevel, item: resolvedItem, ability: resolvedAbility, teraType: parsedTeraType!, nature: resolvedNature, statPoints: parsedStatPoints, moves: resolvedMoves.slice(0, 4) as (Move | null)[] };
  };


  const handleParseAndAddMultipleMembers = () => {
    if (!selectedTeamId || importText.trim() === '') return;
    const pokemonTexts = importText.split(/\n\n+/).filter(text => text.trim() !== '');
    pokemonTexts.forEach((text) => {
      const member = parseSinglePokemon(text);
      if (member) {
        addMemberToTeam(selectedTeamId, member);
      }
    });
    setImportText('');
  };

  const createDefaultTeamMember = (): TeamMember => {
    const defaultPokemon = pokemon[0];
    return {
      id: `new-${Date.now().toString()}`,
      pokemon: defaultPokemon,
      level: 50, item: null, ability: null,
      teraType: defaultPokemon.types[0] || 'normal',
      nature: natures.find(n => n.name === 'がんばりや') || natures[0] || null, // namespaces/data/natures.ts uses name for JP name
      statPoints: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      moves: [null, null, null, null],
    };
  };

  const handleAddNewMember = () => {
    if (!selectedTeam || selectedTeam.members.length >= 6) return;
    setEditingMember(createDefaultTeamMember());
    setIsNewMember(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsNewMember(false);
  };

  const handleSaveEditedMember = (updatedMemberData: TeamMember) => {
    if (!selectedTeamId) return;
    if (isNewMember) {
      addMemberToTeam(selectedTeamId, updatedMemberData);
    } else {
      updateMemberInTeam(selectedTeamId, updatedMemberData);
    }
    setEditingMember(null);
    setIsNewMember(false);
  };

  const handleCloseEditor = () => {
    setEditingMember(null);
    setIsNewMember(false);
  };

  const handleSendToDefender = (member: TeamMember) => {
    loadAsDefender(member);
    const event = new CustomEvent('switchToDamageTab');
    window.dispatchEvent(event);
  };
  const handleSendToAttacker = (member: TeamMember) => {
    loadAsAttacker(member);
    const event = new CustomEvent('switchToDamageTab');
    window.dispatchEvent(event);
  };

  const handleDeleteMemberFromTeam = (memberId: string) => {
    if (!selectedTeamId) return;
    deleteMemberFromTeam(selectedTeamId, memberId);
  };


  // チーム全体をコピーする新しい関数
  const handleCopyTeamToClipboard = () => {
    if (!selectedTeam || selectedTeam.members.length === 0) {
      setCopySuccessMessage('チームにメンバーがいません。');
      return;
    }
    const teamText = selectedTeam.members
      .map(member => formatTeamMemberToText(member))
      .join('\n\n'); // ★ 修正点: joinの引数を改行2つに変更

    navigator.clipboard.writeText(teamText)
      .then(() => {
        setCopySuccessMessage(`${selectedTeam.name} 全体をコピーしました！`);
      })
      .catch(err => {
        console.error('チーム全体のクリップボードへのコピーに失敗しました:', err);
        setCopySuccessMessage('チーム全体のコピーに失敗しました。');
      });
  };

  // ★★★ ここからが修正された関数です ★★★
  const handleGenerateImage = async () => {
    if (!selectedTeam) return;
    setIsGeneratingImage(true);
    try {
      const svgString = await createTeamImage(selectedTeam.members);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

      img.onload = () => {
        // requestAnimationFrame を使い、ブラウザの次の描画フレームで処理を実行する
        requestAnimationFrame(async () => {
          try {
            // img.decode() はサポートされている環境では有効なので残しておく
            if (img.decode) {
              await img.decode();
            } else {
              // decode APIがない古いブラウザ向けのフォールバック
              await new Promise(resolve => setTimeout(resolve, 50)); // 念のためごく短い待機
            }

            const canvas = document.createElement('canvas');
            const scale = 2; // 高解像度対応
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              setIsGeneratingImage(false);
              URL.revokeObjectURL(url);
              return;
            }

            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            // モバイル端末で、Web Share APIが利用可能な場合
            if (isMobile && navigator.share) {
              canvas.toBlob(async (blob) => {
                if (blob) {
                  const file = new File([blob], `${selectedTeam.name}.png`, { type: 'image/png' });
                  try {
                    await navigator.share({
                      files: [file],
                      title: `${selectedTeam.name}`,
                      text: 'チームの画像',
                    });
                  } catch (err) {
                    // 共有がキャンセルされた場合など
                  }
                }
                setIsGeneratingImage(false);
                URL.revokeObjectURL(url);
              }, 'image/png');
            } else {
              // PCまたはWeb Share APIが使えない場合、直接ダウンロード
              const pngUrl = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = `${selectedTeam.name}.png`;
              a.click();
              setIsGeneratingImage(false);
              URL.revokeObjectURL(url);
            }
          } catch (renderError) {
            console.error('Canvas rendering error:', renderError);
            setIsGeneratingImage(false);
            URL.revokeObjectURL(url);
          }
        });
      };

      img.onerror = () => {
        console.error('画像の読み込みに失敗しました。');
        setIsGeneratingImage(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;

    } catch (error) {
      console.error('画像生成エラー:', error);
      setIsGeneratingImage(false);
    }
  };
  // ★★★ ここまでが修正された関数です ★★★


  const renderTeamList = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleCreateTeam} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"><Plus className="h-4 w-4" />新しいチーム</button>
      </div>
      {teams.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-400 mb-4">チームがありません。</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-gray-800 rounded-lg p-3 border-2 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer" onClick={() => handleSelectTeam(team)}>
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => {
                    e.stopPropagation(); // 親要素へのクリックイベント伝播を防ぐ
                    updateTeamName(team.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()} // inputクリック時も伝播を防ぐ
                  className="text-md font-semibold truncate bg-transparent border-none focus:ring-0 focus:outline-none text-white p-0 flex-grow mr-2"
                  placeholder="チーム名"
                />
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {/* <button onClick={(e) => { e.stopPropagation(); alert('チーム全体のコピー機能は未実装です'); }} className="p-1 hover:bg-gray-700 rounded-full transition-colors"><CopyIcon className="h-3 w-3" /></button> */}
                  <button onClick={(e) => { e.stopPropagation(); deleteTeam(team.id); }} className="p-1 hover:bg-gray-700 rounded-full transition-colors text-red-500 hover:text-red-400"><X className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {team.members.slice(0, 6).map((member) => (
                  <div key={member.id} className="relative aspect-square bg-gray-700 rounded overflow-hidden">
                    <img src={getPokemonIconPath(member.pokemon.id)} alt={member.pokemon.name} className="w-full h-full object-contain" />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - team.members.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="bg-gray-700 rounded aspect-square flex items-center justify-center"><Plus className="h-5 w-5 text-gray-500" /></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderTeamEdit = () => {
    if (!selectedTeam) return null;

    return (
      <>
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReturnToList}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </button>
            <button
              onClick={handleCopyTeamToClipboard}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors text-sm text-gray-900 font-medium"
              title="チーム全体をShowdown形式でコピー"
            >
              <CopyIcon className="h-4 w-4" />
              コピー
            </button>
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm text-white font-medium disabled:opacity-50"
              title="パーティーを画像として出力"
            >
              {isGeneratingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  画像出力
                </>
              )}
            </button>
          </div>
          <div className="w-full md:w-auto flex-grow md:flex-grow-0 md:text-right"> {/* チーム名を右寄せまたは中央に */}
            <input
              type="text"
              value={selectedTeam.name}
              onChange={(e) => updateTeamName(selectedTeam.id, e.target.value)}
              className="text-xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none text-white p-0 w-full md:w-auto text-center md:text-right"
              placeholder="チーム名"
            />
          </div>
        </div>
        {/* コピー成功メッセージ表示 */}
        {copySuccessMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm">
            {copySuccessMessage}
          </div>
        )}

        {selectedTeam.members.length < 6 && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">ポケモンをテキストで追加（最大6匹まで一度に追加可能）</h3>
            <p className="text-sm text-gray-400 mb-3">各ポケモンの情報を空行で区切ってください。複数匹を一度に追加できます。</p>
            <textarea
              className="w-full h-40 p-3 bg-gray-700 border border-gray-600 rounded text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder={`複数匹の例（空行で区切る）:\n\nCharizard @ Life Orb\nAbility: Blaze\nLevel: 50\nEVs: 252 SpA / 4 SpD / 252 Spe\nTimid Nature\n- Flamethrower\n- Solar Beam\n- Focus Blast\n- Roost`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-500">残り追加可能数: {6 - selectedTeam.members.length}匹</p>
              <button onClick={handleParseAndAddMultipleMembers} disabled={selectedTeam.members.length >= 6 || importText.trim() === ''} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"><UploadCloud className="h-4 w-4" />テキストからチームに追加</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {selectedTeam.members.map((member) => (
            <div key={member.id} className="relative group">
              <TeamMemberCard member={member} onClick={() => handleEditMember(member)} />
              <div className="absolute top-1 right-1 flex flex-col items-end space-y-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                <button onClick={(e) => { e.stopPropagation(); handleDeleteMemberFromTeam(member.id); }} className="p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white flex items-center justify-center w-6 h-6" title={`${member.pokemon.name} をチームから削除`}><X className="h-4 w-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); handleSendToAttacker(member); }} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 min-w-[60px] text-center" title={`${member.pokemon.name} を攻撃側として計算ツールに送る`}>攻撃側へ</button>
                <button onClick={(e) => { e.stopPropagation(); handleSendToDefender(member); }} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 min-w-[60px] text-center" title={`${member.pokemon.name} を防御側として計算ツールに送る`}>防御側へ</button>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 6 - selectedTeam.members.length) }).map((_, index) => (
            <div key={`empty-slot-${index}`} className="bg-gray-800 p-3 rounded-lg shadow border border-dashed border-gray-600 flex flex-col items-center justify-center min-h-[230px] cursor-pointer hover:border-blue-500 transition-colors" onClick={handleAddNewMember} title="ポケモンを追加"><Plus className="h-10 w-10 text-gray-500 mb-2" /><span className="text-gray-400 text-sm">ポケモンを追加</span></div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {currentView === 'list' && renderTeamList()}
      {currentView === 'editTeam' && renderTeamEdit()}

      {editingMember && (
        <TeamMemberEditor
          member={editingMember}
          allPokemon={pokemon}
          allMoves={moves}
          allItems={items}
          allAbilities={abilities}
          allNatures={natures}
          onSave={handleSaveEditedMember}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default TeamManager;