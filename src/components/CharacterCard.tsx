import React from 'react';
import { Character } from '../types/character';
import { getIconPath, getElementIconPath, getPositionIconPath } from '../utils/characterUtils';

interface CharacterCardProps {
  character: Character;
  // ★ プロップを追加
  isSelected: boolean;
  onClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, isSelected, onClick }) => {
  const iconPath = getIconPath(character);

  // ★ 選択状態に応じてスタイルを動的に変更
  const cardClasses = `
    bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer
    ${isSelected ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'hover:scale-105'}
  `;

  return (
    // ★ classNameとonClickイベントハンドラを適用
    <div className={cardClasses} onClick={onClick}>
      <div className="relative">
        <img
          src={iconPath}
          alt={character.name}
          className="w-full h-32 object-cover bg-gray-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/icon/000001.webp';
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <img
            src={getElementIconPath(character.attribute)}
            alt={character.attribute}
            className="w-6 h-6 bg-white rounded"
          />

        </div>
        <div className="absolute top-2 right-2">
          <div className="flex">
            {[...Array(character.rarity || 1)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-800 mb-1 truncate">
          {character.fullName || 'キャラクター名不明'}
        </h3>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{character.attribute}</span>
          <span>{character.position}</span>
          <span>{character.type}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;