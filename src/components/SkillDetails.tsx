import React, { useState } from 'react';
import { Character, UnitSkills, SkillDetail, SkillVersion, Effect } from '../types/character';
import { Star, Swords, Shield, Zap } from 'lucide-react';

interface SkillDetailsProps {
  character: Character;
  skillData: UnitSkills[string] | undefined;
}

// ★ 計算ロジックをここにまとめる
const calculateEffectValue = (formula: string | null, level: number): number | null => {
  if (!formula) return null;

  // formulaが単なる数値の場合
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }

  // スキルLvを含む計算式の場合
  if (formula.includes('スキルLv')) {
    try {
      // 'スキルLv'を実際のレベルに置き換える
      const expression = formula.replace(/スキルLv/g, String(level));
      
      // 安全に計算式を評価するためにFunctionコンストラクタを使用
      // 注意: この方法は単純な四則演算のみを想定しています。
      // '物理攻撃力'などの他の変数が含まれる式はここでは計算できません。
      return Math.floor(new Function('return ' + expression)());
    } catch (e) {
      // 計算できない複雑な式の場合はnullを返す
      console.error("Formula calculation error:", e);
      return null;
    }
  }

  // 計算できない場合はnullを返す
  return null;
};


const SkillDetails: React.FC<SkillDetailsProps> = ({ character, skillData }) => {
  // ★ レベルを管理するstateを追加
  const [level, setLevel] = useState(356);

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLevel(isNaN(value) ? 0 : value);
  };
  
  // ★ Effectの描画部分を更新
  const renderEffect = (effect: Effect, index: number) => {
    const calculatedValue = calculateEffectValue(effect.formula, level);
    
    return (
      <div key={index} className="text-sm text-gray-700 mb-2 pl-4 border-l-2 border-gray-200">
        <p>
          <span className="font-semibold text-indigo-600">{effect.target}</span> に 
          <span className="font-semibold text-emerald-700"> {effect.type}</span>
          {/* ★ 計算結果を表示 */}
          {calculatedValue !== null && (
            <span className="font-bold text-blue-600 ml-2 text-base">[{calculatedValue.toLocaleString()}]</span>
          )}
        </p>
        {effect.formula && (
          <p className="pl-2 text-gray-500 text-xs">計算式: <code className="bg-gray-200 text-gray-800 px-1 rounded">{effect.formula}</code></p>
        )}
        {effect.duration && (
          <p className="pl-2 text-gray-500 text-xs">持続時間: {effect.duration}秒</p>
        )}
         {effect.condition && (
          <p className="pl-2 text-gray-500 text-xs">条件: {effect.condition}</p>
        )}
        {effect.note && (
          <p className="pl-2 text-gray-500 text-xs">備考: {effect.note}</p>
        )}
      </div>
    );
  };

  const renderVersion = (version: SkillVersion, index: number) => (
    <div key={index} className="mb-4 p-3 bg-white rounded-md shadow-sm">
      <h5 className="font-semibold text-base text-gray-800">{version.name}</h5>
      <p className="text-sm text-gray-600 italic my-2">{version.description}</p>
      <div className="space-y-2">
        {version.effects.map(renderEffect)}
      </div>
    </div>
  );

  const renderSkill = (skill: SkillDetail | undefined, title: string, icon: React.ReactNode) => {
    if (!skill) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
        </div>
        {skill.versions.map(renderVersion)}
      </div>
    );
  };
  
  const simpleSkills = character.skills;

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b-2 border-gray-300 pb-3">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">{character.fullName} - スキル詳細</h3>
        {/* ★ レベル入力欄 */}
        <div className="flex items-center gap-2">
          <label htmlFor="level-input" className="font-semibold text-sm text-gray-700">Lv:</label>
          <input
            id="level-input"
            type="number"
            value={level}
            onChange={handleLevelChange}
            className="w-24 p-1 border border-gray-300 rounded-md text-center"
          />
        </div>
      </div>
      
      {skillData ? (
        <div className="space-y-6">
          {renderSkill(skillData.union_burst, 'ユニオンバースト', <Star className="w-6 h-6 text-yellow-500" />)}
          {renderSkill(skillData.skill_1 || skillData.skill_1_normal, 'スキル1', <Swords className="w-6 h-6 text-red-500" />)}
          {renderSkill(skillData.skill_2 || skillData.skill_2_normal, 'スキル2', <Shield className="w-6 h-6 text-blue-500" />)}
          {skillData.skill_1_overdrive && renderSkill(skillData.skill_1_overdrive, 'スキル1 (モードチェンジ後)', <Swords className="w-6 h-6 text-red-700" />)}
          {skillData.skill_2_overdrive && renderSkill(skillData.skill_2_overdrive, 'スキル2 (モードチェンジ後)', <Shield className="w-6 h-6 text-blue-700" />)}
          {renderSkill(skillData.special_skill_1, '特殊スキル1', <Zap className="w-6 h-6 text-purple-500" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-md shadow-sm">
            <h4 className="text-md font-bold text-gray-900 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" />{simpleSkills.unionBurst.name}</h4>
            <p className="text-sm text-gray-700 mt-2">{simpleSkills.unionBurst.description}</p>
          </div>
          <div className="p-4 bg-white rounded-md shadow-sm">
            <h4 className="text-md font-bold text-gray-900 flex items-center gap-2"><Swords className="w-5 h-5 text-red-500" />{simpleSkills.skill1.name}</h4>
            <p className="text-sm text-gray-700 mt-2">{simpleSkills.skill1.description}</p>
          </div>
          <div className="p-4 bg-white rounded-md shadow-sm">
            <h4 className="text-md font-bold text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" />{simpleSkills.skill2.name}</h4>
            <p className="text-sm text-gray-700 mt-2">{simpleSkills.skill2.description}</p>
          </div>
           <p className="text-center text-gray-500 text-sm mt-4">このキャラクターの詳細なスキルデータは現在準備中です。</p>
        </div>
      )}
    </div>
  );
};

export default SkillDetails;