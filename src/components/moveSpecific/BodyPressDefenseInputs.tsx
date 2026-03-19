import React from 'react';
import { AttackerState } from '../AttackerPanel'; // 親コンポーネントの型定義をインポート
import StatSlider from '../StatSlider';
import NatureSelector from '../NatureSelector';
import RankSelector from '../RankSelector';
import { NatureModifier } from '../../types'; // NatureModifier 型をインポート

interface BodyPressDefenseInputsProps {
  attacker: AttackerState;
  index: number;
  defenseBaseValueForDisplay: number;
  onDefenseInputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onDefenseInputBlur: (index: number) => void;
  onDefenseEvChange: (ev: number, index: number) => void;
  onDefenseNatureChange: (nature: NatureModifier, index: number) => void;
  onDefenseRankChange: (rank: number, index: number) => void;
}

const BodyPressDefenseInputs: React.FC<BodyPressDefenseInputsProps> = ({
  attacker,
  index,
  defenseBaseValueForDisplay,
  onDefenseInputChange,
  onDefenseInputBlur,
  onDefenseEvChange,
  onDefenseNatureChange,
  onDefenseRankChange,
}) => {
  if (!attacker.pokemon || !attacker.isEnabled) {
    // ポケモンが選択されていない、または無効化されている場合は何も表示しないか、
    // disabled状態のUIを表示するなど、適宜調整してください。
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={`defenseInput-${index}`} className="text-sm font-medium text-white">ぼうぎょ (ボディプレス用)</label>
        <input
          id={`defenseInput-${index}`}
          type="number"
          value={attacker.defenseInputValue}
          onChange={(e) => onDefenseInputChange(e, index)}
          onBlur={() => onDefenseInputBlur(index)}
          className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded text-white text-sm"
          min="0"
          disabled={!attacker.pokemon || !attacker.isEnabled}
        />
      </div>
      <StatSlider
        label=""
        value={attacker.defenseStat?.ev || 0}
        max={252}
        onChange={(ev) => onDefenseEvChange(ev, index)}
        realValue={defenseBaseValueForDisplay}
        disabled={!attacker.pokemon || !attacker.isEnabled}
      />
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1">
          <h4 className="text-sm text-gray-400 mb-1">性格補正</h4>
          <NatureSelector
            selected={attacker.defenseStat?.nature || 1.0}
            onChange={(n) => onDefenseNatureChange(n, index)}
            disabled={!attacker.pokemon || !attacker.isEnabled}
          />
        </div>
        <div className="text-sm text-gray-400 self-end pb-1">努力値: {attacker.defenseStat?.ev || 0}</div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1">
          <RankSelector
            value={attacker.defenseStat?.rank || 0}
            onChange={(r) => onDefenseRankChange(r, index)}
            label="ぼうぎょランク"
            disabled={!attacker.pokemon || !attacker.isEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default BodyPressDefenseInputs;