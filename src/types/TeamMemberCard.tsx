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

  const renderEffortValueRow = (statKey: StatKey, shortLabel: string, isCompact: boolean) => {
    const pointValue = member.statPoints[statKey];
    const actualStat = calculateActualStat(statKey);
    const MAX_POINTS = 26;
    const pointPercentage = Math.min((pointValue / MAX_POINTS) * 100, 100);

    let labelColor = "text-gray-300";
    let statIndicator = "";
    if (member.nature) {
        if (member.nature.increasedStat === statKey) {
            labelColor = "text-green-400";
            statIndicator = "↑";
        }
        if (member.nature.decreasedStat === statKey) {
            labelColor = "text-red-400";
            statIndicator = "↓";
        }
    }

    const barBaseColor = isCompact ? "bg-gray-600" : "bg-gray-700";
    const barFillColor = "bg-sky-500";

    if (isCompact) {
      return (
        <div className="flex items-center text-xs mb-0.5">
          <span className={`w-4 font-medium ${labelColor}`}>{shortLabel}{statIndicator}</span>
          <div className={`w-8 text-right pr-1 text-white tabular-nums`}>{actualStat}</div>
          <div className={`w-12 text-right pr-2 text-white tabular-nums`}>{pointValue > 0 ? pointValue : "-"}</div>
          <div className={`flex-grow bg-gray-700 h-3 rounded-sm overflow-hidden`}>
            <div style={{ width: `${pointPercentage}%` }} className={`h-full bg-sky-500`}></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-xs mb-0.5">
          <span className={`w-4 font-medium ${labelColor}`}>{shortLabel}{statIndicator}</span>
          <div className={`w-8 text-right pr-1 text-white tabular-nums`}>{actualStat}</div>
          <div className={`w-12 md:w-16 text-right pr-1 md:pr-2 text-white tabular-nums`}>{pointValue > 0 ? pointValue : "-"}</div>
          <div className={`flex-grow ${barBaseColor} h-3 rounded-sm overflow-hidden`}>
            <div style={{ width: `${pointPercentage}%` }} className={`h-full ${barFillColor}`}></div>
          </div>
        </div>
      );
    }
  };


  return (
    <div
      className="bg-gray-800 p-2 md:p-3 rounded-lg shadow text-sm w-full border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
      onClick={onClick}
    >
      <div className="flex mb-2">
        <div className="mr-2 md:mr-3 flex-shrink-0">
          <img
            src={getPokemonIconPath(member.pokemon.id)}
            alt={member.pokemon.name}
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
        </div>

        <div className="flex-grow min-w-0">
          <h3 className="text-sm md:text-base font-bold text-white truncate">{member.pokemon.name}</h3>
          {member.nature && (
            <p className="text-xs text-gray-400 truncate mt-0.5 md:mt-0 md:mb-0.5">
              性格: {member.nature.name}
            </p>
          )}
          {member.item && (
            <div className="flex items-center mt-0.5">
              <span className="text-xs text-gray-400 mr-1 flex-shrink-0">持物:</span>
              <img
                src={`/itemsIcon/${member.item.id}.png`}
                alt={member.item.name}
                className="w-4 h-4 md:w-5 md:h-5 object-contain flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-gray-300 text-xs px-0.5 py-0.5 md:px-2 rounded truncate flex-1 min-w-0">
                {member.item.name}
              </span>
            </div>
          )}
          {member.ability && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              特性: {member.ability.name}
            </p>
          )}
           <p className="text-xs text-gray-400 mt-0.5">
            テラス:
            <span
              style={{ backgroundColor: PokemonTypeColors[member.teraType] || '#777', color: 'white', padding: '1px 4px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 'bold' }}
              className="ml-1 md:ml-1.5"
            >
              {POKEMON_TYPE_NAMES_JP[member.teraType] || member.teraType.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 md:gap-x-3">
        <div className="space-y-1">
            {(member.moves.length > 0 ? member.moves : [null, null, null, null]).slice(0, 4).map((move, i) => (
            <div key={i} className={`text-xs text-gray-200 bg-gray-700 px-1.5 py-1 rounded h-6 flex items-center truncate ${!move ? 'opacity-50' : ''}`}>
                {move ? (
                <>
                    <img
                        src={`/typesIcon/${move.type}_icon_sv.png`}
                        alt={move.type}
                        className="w-4 h-4 md:w-5 md:h-5 mr-1.5 flex-shrink-0 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="truncate flex-grow">{move.name}</span>
                </>
                ) : <span className="text-gray-500 flex items-center h-full">-</span>}
            </div>
            ))}
        </div>

        <div className="space-y-0.5">
            <div className="hidden md:block">
                {renderEffortValueRow('hp', 'H', false)}
                {renderEffortValueRow('attack', 'A', false)}
                {renderEffortValueRow('defense', 'B', false)}
                {renderEffortValueRow('specialAttack', 'C', false)}
                {renderEffortValueRow('specialDefense', 'D', false)}
                {renderEffortValueRow('speed', 'S', false)}
            </div>
            <div className="block md:hidden">
                {renderEffortValueRow('hp', 'H', true)}
                {renderEffortValueRow('attack', 'A', true)}
                {renderEffortValueRow('defense', 'B', true)}
                {renderEffortValueRow('specialAttack', 'C', true)}
                {renderEffortValueRow('specialDefense', 'D', true)}
                {renderEffortValueRow('speed', 'S', true)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;