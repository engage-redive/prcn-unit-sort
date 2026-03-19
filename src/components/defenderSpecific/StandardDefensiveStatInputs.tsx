// src/components/defenderSpecific/StandardDefensiveStatInputs.tsx
import React from 'react';
import { Pokemon, StatCalculation, NatureModifier } from '../../types';
import StatSlider from '../StatSlider';
import NatureSelector from '../NatureSelector';
import RankSelector from '../RankSelector';

interface StandardDefensiveStatInputsProps {
  selectedPokemon: Pokemon | null; // 無効化制御用
  hpStat: StatCalculation;
  defenseStat: StatCalculation;
  specialDefenseStat: StatCalculation;
  hpInputValue: string;
  defenseInputValue: string;
  specialDefenseInputValue: string;
  onHpEvChange: (ev: number) => void;
  onDefenseEvChange: (ev: number) => void;
  onSpecialDefenseEvChange: (ev: number) => void;
  onDefenseNatureChange: (nature: NatureModifier) => void;
  onSpecialDefenseNatureChange: (nature: NatureModifier) => void;
  onDefenseRankChange: (rank: number) => void;
  onSpecialDefenseRankChange: (rank: number) => void;
  onHpInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDefenseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSpecialDefenseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHpInputBlur: () => void;
  onDefenseInputBlur: () => void;
  onSpecialDefenseInputBlur: () => void;
  hpBaseValueForDisplay: number; // StatSlider用
  defenseBaseValueForDisplay: number; // StatSlider用
  specialDefenseBaseValueForDisplay: number; // StatSlider用
}

const StandardDefensiveStatInputs: React.FC<StandardDefensiveStatInputsProps> = ({
  selectedPokemon,
  hpStat,
  defenseStat,
  specialDefenseStat,
  hpInputValue,
  defenseInputValue,
  specialDefenseInputValue,
  onHpEvChange,
  onDefenseEvChange,
  onSpecialDefenseEvChange,
  onDefenseNatureChange,
  onSpecialDefenseNatureChange,
  onDefenseRankChange,
  onSpecialDefenseRankChange,
  onHpInputChange,
  onDefenseInputChange,
  onSpecialDefenseInputChange,
  onHpInputBlur,
  onDefenseInputBlur,
  onSpecialDefenseInputBlur,
  hpBaseValueForDisplay,
  defenseBaseValueForDisplay,
  specialDefenseBaseValueForDisplay,
}) => {
  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="hpInputDefender" className="text-sm font-medium text-white">HP</label>
          <input
            id="hpInputDefender"
            type="number"
            value={hpInputValue}
            onChange={onHpInputChange}
            onBlur={onHpInputBlur}
            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
            min="0"
            disabled={!selectedPokemon}
          />
        </div>
        <StatSlider
          label=""
          value={hpStat.statPoints}
          max={252}
          onChange={onHpEvChange}
          realValue={hpBaseValueForDisplay} // App.tsxから渡される計算済みの実数値
          disabled={!selectedPokemon}
        />
        <div className="flex justify-end">
          <div className="text-sm text-gray-400 self-end pb-1">
            努力値: {hpStat.statPoints}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="defenseInputDefender" className="text-sm font-medium text-white">ぼうぎょ</label>
          <input
            id="defenseInputDefender"
            type="number"
            value={defenseInputValue}
            onChange={onDefenseInputChange}
            onBlur={onDefenseInputBlur}
            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
            min="0"
            disabled={!selectedPokemon}
          />
        </div>
        <StatSlider
          label=""
          value={defenseStat.statPoints}
          max={252}
          onChange={onDefenseEvChange}
          realValue={defenseBaseValueForDisplay} // App.tsxから渡される計算済みの実数値
          disabled={!selectedPokemon}
        />
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <h4 className="text-sm text-gray-400 mb-1">性格補正</h4>
            <NatureSelector
              selected={defenseStat.nature}
              onChange={onDefenseNatureChange}
              disabled={!selectedPokemon}
            />
          </div>
          <div className="text-sm text-gray-400 self-end pb-1">
            努力値: {defenseStat.statPoints}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <RankSelector
              value={defenseStat.rank}
              onChange={onDefenseRankChange}
              label="ぼうぎょランク"
              disabled={!selectedPokemon}
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="specialDefenseInputDefender" className="text-sm font-medium text-white">とくぼう</label>
          <input
            id="specialDefenseInputDefender"
            type="number"
            value={specialDefenseInputValue}
            onChange={onSpecialDefenseInputChange}
            onBlur={onSpecialDefenseInputBlur}
            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
            min="0"
            disabled={!selectedPokemon}
          />
        </div>
        <StatSlider
          label=""
          value={specialDefenseStat.statPoints}
          max={252}
          onChange={onSpecialDefenseEvChange}
          realValue={specialDefenseBaseValueForDisplay} // App.tsxから渡される計算済みの実数値
          disabled={!selectedPokemon}
        />
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <h4 className="text-sm text-gray-400 mb-1">性格補正</h4>
            <NatureSelector
              selected={specialDefenseStat.nature}
              onChange={onSpecialDefenseNatureChange}
              disabled={!selectedPokemon}
            />
          </div>
          <div className="text-sm text-gray-400 self-end pb-1">
            努力値: {specialDefenseStat.statPoints}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <RankSelector
              value={specialDefenseStat.rank}
              onChange={onSpecialDefenseRankChange}
              label="とくぼうランク"
              disabled={!selectedPokemon}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StandardDefensiveStatInputs;