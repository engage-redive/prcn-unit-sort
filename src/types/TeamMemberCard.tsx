// src/components/TeamMemberCard.tsx
import React from 'react';
import { PokemonType } from '../types';
import { POKEMON_TYPE_NAMES_JP } from '../calculation/pokemonTypesJp';
import { pokedex } from '../data/pokedex';

import { TeamMember } from '../stores/teamStore';
import { getPokemonIconPath } from '../utils/uiHelpers';
export const PokemonTypeColors: Record<PokemonType, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    stellar: '#75CADD',
};

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
}

type StatKey = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

// 性格の英語→日本語マッピング
const NATURE_NAME_JP: Record<string, string> = {
  Hardy: 'がんばりや', Lonely: 'さみしがり', Brave: 'ゆうかん', Adamant: 'いじっぱり', Naughty: 'やんちゃ',
  Bold: 'ずぶとい', Docile: 'すなお', Relaxed: 'のんき', Impish: 'わんぱく', Lax: 'のうてんき',
  Timid: 'おくびょう', Hasty: 'せっかち', Serious: 'まじめ', Jolly: 'ようき', Naive: 'むじゃき',
  Modest: 'ひかえめ', Mild: 'おっとり', Quiet: 'れいせい', Bashful: 'てれや', Rash: 'うっかりや',
  Calm: 'おだやか', Gentle: 'おとなしい', Sassy: 'なまいき', Careful: 'しんちょう', Quirky: 'きまぐれ',
};

const STAT_LABELS: { key: StatKey; short: string }[] = [
  { key: 'hp', short: 'H' },
  { key: 'attack', short: 'A' },
  { key: 'defense', short: 'B' },
  { key: 'specialAttack', short: 'C' },
  { key: 'specialDefense', short: 'D' },
  { key: 'speed', short: 'S' },
];

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onClick }) => {
  const pokemonData = pokedex.find(p => p.id === member.pokemon.id);

  const calculateActualStat = (stat: StatKey): number => {
    if (!pokemonData) return 0;

    const baseStat = pokemonData.baseStats[stat];
    const statPoints = member.statPoints[stat];

    if (stat === 'hp') {
      if (pokemonData.nameEn === 'Shedinja') return 1;
      return Math.floor(baseStat + 75 + statPoints);
    } else {
      const natureValue = getNatureModifier(member.nature, stat);
      const statValue = Math.floor(baseStat + 20 + statPoints);
      return Math.floor(statValue * natureValue);
    }
  };

  const getNatureModifier = (
    nature: { name: string, nameEn?: string, increasedStat?: string | null, decreasedStat?: string | null } | null,
    stat: StatKey
  ): number => {
    if (!nature) return 1.0;
    if (nature.increasedStat === stat) return 1.1;
    if (nature.decreasedStat === stat) return 0.9;
    return 1.0;
  };

  // 性格補正のヘッダー背景色を返す
  const getNatureHeaderBg = (stat: StatKey): string => {
    if (!member.nature) return '';
    if (member.nature.increasedStat === stat) return 'bg-red-900/60';
    if (member.nature.decreasedStat === stat) return 'bg-blue-900/60';
    return '';
  };

  const teraColor = PokemonTypeColors[member.teraType] || '#777';
  const natureName = member.nature
    ? (NATURE_NAME_JP[member.nature.nameEn ?? ''] || member.nature.name || member.nature.nameEn || '')
    : null;

  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer select-none group"
      style={{
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1318 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
      }}
    >
      {/* 背景グロー */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 85% 20%, ${teraColor}22 0%, transparent 60%)`,
        }}
      />

      {/* ポケモン大画像（右側背景オーバーレイ） */}
      <img
        src={getPokemonIconPath(member.pokemon.id)}
        alt={member.pokemon.name}
        className="absolute pointer-events-none select-none"
        style={{
          right: '-8px',
          top: '-4px',
          width: '100px',
          height: '100px',
          objectFit: 'contain',
          opacity: 0.18,
          filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.15))',
        }}
      />

      <div className="relative z-10 p-2.5">
        {/* ─── ヘッダー行 ─── */}
        <div className="flex items-start gap-2 mb-2">
          {/* ポケモンアイコン（メイン・鮮明） */}
          <div className="flex-shrink-0 relative">
            <img
              src={getPokemonIconPath(member.pokemon.id)}
              alt={member.pokemon.name}
              className="object-contain rounded-lg"
              style={{
                width: '60px',
                height: '60px',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
              }}
            />
          </div>

          {/* ポケモン名 + 性格 + テラスタル + 持ち物 */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-white truncate" style={{ fontSize: '0.92rem', lineHeight: 1.2 }}>
                {member.pokemon.name}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* テラスタルアイコン */}
              <div className="flex items-center gap-0.5">
                <img
                  src={`/teraIcon/${member.teraType}.png`}
                  alt={`テラス: ${POKEMON_TYPE_NAMES_JP[member.teraType] ?? member.teraType}`}
                  title={`テラス: ${POKEMON_TYPE_NAMES_JP[member.teraType] ?? member.teraType}`}
                  className="object-contain flex-shrink-0"
                  style={{ width: '20px', height: '20px' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              {/* 性格（日本語） */}
              {natureName && (
                <span
                  className="text-gray-300 font-medium"
                  style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: '4px' }}
                >
                  {natureName}
                </span>
              )}

              {/* 特性 */}
              {member.ability && (
                <span
                  className="text-yellow-300/80"
                  style={{ fontSize: '0.68rem', background: 'rgba(255,220,50,0.08)', padding: '1px 5px', borderRadius: '4px' }}
                >
                  {member.ability.name}
                </span>
              )}
            </div>

            {/* 持ち物 */}
            {member.item && (
              <div className="flex items-center gap-1 mt-1">
                <img
                  src={`/itemsIcon/${member.item.id}.png`}
                  alt={member.item.name}
                  className="object-contain flex-shrink-0"
                  style={{ width: '22px', height: '22px' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-gray-300 truncate" style={{ fontSize: '0.70rem' }}>
                  {member.item.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── 区切り線 ─── */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '6px' }} />

        {/* ─── 技 + ステータスグリッド（横並び） ─── */}
        <div className="flex gap-2">
          {/* 技リスト */}
          <div className="flex flex-col gap-0.5" style={{ flex: '1 1 0', minWidth: 0 }}>
            {(member.moves.length > 0 ? member.moves : [null, null, null, null]).slice(0, 4).map((move, i) => (
              <div
                key={i}
                className="flex items-center gap-1 rounded"
                style={{
                  background: move ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  padding: '2px 5px',
                  minHeight: '22px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {move ? (
                  <>
                    <img
                      src={`/typesIcon/${move.type}_icon_sv.png`}
                      alt={move.type}
                      className="object-contain flex-shrink-0"
                      style={{ width: '36px', height: '14px' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="text-gray-200 truncate" style={{ fontSize: '0.68rem' }}>
                      {move.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600" style={{ fontSize: '0.68rem' }}>—</span>
                )}
              </div>
            ))}
          </div>

          {/* ─── ステータスグリッド（3段×6列） ─── */}
          <div style={{ flex: '0 0 auto' }}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '2px',
                minWidth: '144px',
              }}
            >
              {/* 1段目: ヘッダー H A B C D S */}
              {STAT_LABELS.map(({ key, short }) => (
                <div
                  key={`header-${key}`}
                  className={`flex items-center justify-center rounded-sm text-center font-bold ${getNatureHeaderBg(key)}`}
                  style={{ fontSize: '0.65rem', padding: '1px 0', color: (() => {
                    if (!member.nature) return '#9ca3af';
                    if (member.nature.increasedStat === key) return '#fca5a5';
                    if (member.nature.decreasedStat === key) return '#93c5fd';
                    return '#9ca3af';
                  })() }}
                >
                  {short}
                </div>
              ))}

              {/* 2段目: 実数値 */}
              {STAT_LABELS.map(({ key }) => (
                <div
                  key={`actual-${key}`}
                  className="flex items-center justify-center text-white font-bold tabular-nums"
                  style={{ fontSize: '0.72rem', lineHeight: 1.1 }}
                >
                  {calculateActualStat(key)}
                </div>
              ))}

              {/* 3段目: ポイント */}
              {STAT_LABELS.map(({ key }) => {
                const pt = member.statPoints[key];
                return (
                  <div
                    key={`pt-${key}`}
                    className="flex items-center justify-center tabular-nums"
                    style={{ fontSize: '0.60rem', color: pt > 0 ? '#6ee7b7' : '#4b5563' }}
                  >
                    {pt > 0 ? pt : '—'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;