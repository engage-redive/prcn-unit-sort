import React from 'react';
import { useState, useEffect } from 'react';
import { Character, UnitSkills, FilterOptions } from './types/character';
import { filterCharacters } from './utils/characterUtils';
import FilterPanel from './components/FilterPanel';
import CharacterGrid from './components/CharacterGrid';
import SkillDetails from './components/SkillDetails';
import Modal from './components/Modal'; // ★ Modalをインポート
import { BookOpen } from 'lucide-react';
import charactersData from './data/unit_data.json';
import skillsData from './data/unit_skills.json';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [skills, setSkills] = useState<UnitSkills>({});
  const [filters, setFilters] = useState<FilterOptions>({
    element: [],
    position: [],
    atkType: [],
    roles: [],
    skillFilters: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCharacters(charactersData as Character[]);
      setSkills(skillsData as UnitSkills);
    } catch (err) {
      console.error('Data setting error:', err);
      setError('データの処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  // ★ モーダルを開く（カードクリック時に呼ばれる）
  const handleCharacterSelect = (id: string) => {
    setSelectedCharacterId(id);
  };

  // ★ モーダルを閉じる
  const handleCloseModal = () => {
    setSelectedCharacterId(null);
  }

  const filteredCharacters = filterCharacters(characters, skills, filters);
  
  const selectedCharacter = selectedCharacterId 
    ? characters.find(c => c.id === selectedCharacterId) 
    : null;
  const selectedSkillData = selectedCharacter 
    ? skills[selectedCharacter.fullName] 
    : undefined;
  
  // (if (loading) ... と if (error) ... の部分は変更なし)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              プリンセスコネクト キャラクター図鑑
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={characters.length}
          filteredCount={filteredCharacters.length}
        />
        
        <CharacterGrid 
          characters={filteredCharacters}
          selectedCharacterId={selectedCharacterId}
          onCharacterSelect={handleCharacterSelect} // ハンドラを渡す
        />
        
        {/* ★ ページ下部の詳細表示は削除 */}

        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              フィルター条件に一致するキャラクターが見つかりませんでした
            </p>
          </div>
        )}
      </main>

      {/* ★ モーダルコンポーネントをここに追加 */}
      <Modal isOpen={!!selectedCharacter} onClose={handleCloseModal}>
        {selectedCharacter && (
            <SkillDetails 
              character={selectedCharacter} 
              skillData={selectedSkillData}
            />
        )}
      </Modal>

    </div>
  );
}

export default App;