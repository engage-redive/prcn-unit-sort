import React from 'react';
import { Character } from '../types/character';
import CharacterCard from './CharacterCard';

interface CharacterGridProps {
  characters: Character[];
  // ★ プロップを追加
  selectedCharacterId: string | null;
  onCharacterSelect: (id: string) => void;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({ 
  characters,
  selectedCharacterId,
  onCharacterSelect 
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {characters.map(character => (
        // ★ isSelectedとonClickを渡す
        <CharacterCard 
          key={character.id} 
          character={character}
          isSelected={selectedCharacterId === character.id}
          onClick={() => onCharacterSelect(character.id)}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;