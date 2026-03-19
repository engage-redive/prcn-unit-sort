import React from 'react';
import { AttackerState } from '../AttackerPanel'; // 親コンポーネントの型定義をインポート
import StatSlider from '../StatSlider';
import NatureSelector from '../NatureSelector';
import RankSelector from '../RankSelector';
import { NatureModifier } from '../../types'; // NatureModifier 型をインポート

interface StandardOffensiveStatInputsProps {
  attacker: AttackerState;
  index: number;
  attackBaseValueForDisplay: number;
  specialAttackBaseValueForDisplay: number;
  onAttackInputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onAttackInputBlur: (index: number) => void;
  onAttackEvChange: (ev: number, index: number) => void;
  onAttackNatureChange: (nature: NatureModifier, index: number) => void;
  onAttackRankChange: (rank: number, index: number) => void;
  onSpecialAttackInputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onSpecialAttackInputBlur: (index: number) => void;
  onSpecialAttackEvChange: (ev: number, index: number) => void;
  onSpecialAttackNatureChange: (nature: NatureModifier, index: number) => void;
  onSpecialAttackRankChange: (rank: number, index: number) => void;
}

const StandardOffensiveStatInputs: React.FC<StandardOffensiveStatInputsProps> = ({
  attacker,
  index,
  attackBaseValueForDisplay,
  specialAttackBaseValueForDisplay,
  onAttackInputChange,
  onAttackInputBlur,
  onAttackEvChange,
  onAttackNatureChange,
  onAttackRankChange,
  onSpecialAttackInputChange,
  onSpecialAttackInputBlur,
  onSpecialAttackEvChange,
  onSpecialAttackNatureChange,
  onSpecialAttackRankChange,
}) => {
  if (!attacker.pokemon || !attacker.isEnabled) {
    // ポケモンが選択されていない、または無効化されている場合は何も表示しないか、
    // disabled状態のUIを表示するなど、適宜調整してください。
    // ここでは簡略化のため主要な入力のみを制御します。
  }

  return (
    <>
      <div className="mb-3">
        {/* こうげき入力UI */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={`attackInput-${index}`} className="text-sm font-medium text-white">こうげき</label>
          <input
            id={`attackInput-${index}`}
            type="number"
            value={attacker.attackInputValue}
            onChange={(e) => onAttackInputChange(e, index)}
            onBlur={() => onAttackInputBlur(index)}
            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
            min="0"
            disabled={!attacker.pokemon || !attacker.isEnabled}
          />
        </div>
        <StatSlider
          label=""
          value={attacker.attackStat?.ev || 0}
          max={252}
          onChange={(ev) => onAttackEvChange(ev, index)}
          realValue={attackBaseValueForDisplay}
          disabled={!attacker.pokemon || !attacker.isEnabled}
        />
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <h4 className="text-sm text-gray-400 mb-1">性格補正</h4>
            <NatureSelector
              selected={attacker.attackStat?.nature || 1.0}
              onChange={(n) => onAttackNatureChange(n, index)}
              disabled={!attacker.pokemon || !attacker.isEnabled}
            />
          </div>
          <div className="text-sm text-gray-400 self-end pb-1">努力値: {attacker.attackStat?.ev || 0}</div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <RankSelector
              value={attacker.attackStat?.rank || 0}
              onChange={(r) => onAttackRankChange(r, index)}
              label="こうげきランク"
              disabled={!attacker.pokemon || !attacker.isEnabled}
            />
          </div>
        </div>
      </div>
      <div className="mb-3">
        {/* とくこう入力UI */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={`specialAttackInput-${index}`} className="text-sm font-medium text-white">とくこう</label>
          <input
            id={`specialAttackInput-${index}`}
            type="number"
            value={attacker.specialAttackInputValue}
            onChange={(e) => onSpecialAttackInputChange(e, index)}
            onBlur={() => onSpecialAttackInputBlur(index)}
            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
            min="0"
            disabled={!attacker.pokemon || !attacker.isEnabled}
          />
        </div>
        <StatSlider
          label=""
          value={attacker.specialAttackStat?.ev || 0}
          max={252}
          onChange={(ev) => onSpecialAttackEvChange(ev, index)}
          realValue={specialAttackBaseValueForDisplay}
          disabled={!attacker.pokemon || !attacker.isEnabled}
        />
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <h4 className="text-sm text-gray-400 mb-1">性格補正</h4>
            <NatureSelector
              selected={attacker.specialAttackStat?.nature || 1.0}
              onChange={(n) => onSpecialAttackNatureChange(n, index)}
              disabled={!attacker.pokemon || !attacker.isEnabled}
            />
          </div>
          <div className="text-sm text-gray-400 self-end pb-1">努力値: {attacker.specialAttackStat?.ev || 0}</div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <RankSelector
              value={attacker.specialAttackStat?.rank || 0}
              onChange={(r) => onSpecialAttackRankChange(r, index)}
              label="とくこうランク"
              disabled={!attacker.pokemon || !attacker.isEnabled}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StandardOffensiveStatInputs;