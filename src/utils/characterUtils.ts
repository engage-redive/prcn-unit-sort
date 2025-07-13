
import { unitIdMap } from '../data/unitIconID';import { Character, UnitSkills, FilterOptions, SkillFilter, SortType, Effect } from '../types/character'; // ★ SortTypeをインポート
import { unitIdMap } from '../data/unitIconID';
import { positionOrder } from '../data/positionOrder'; // ★ 隊列順データをインポート
export const getIconPath = (character: Character): string => {
  const unitEntry = unitIdMap.get(character.fullName) || unitIdMap.get(character.name);
  if (unitEntry) {
    if (unitEntry.idStar3 && unitEntry.idStar3 !== 0) {
      return `/icon/${unitEntry.idStar3}.webp`;
    }
    if (unitEntry.idStar1 && unitEntry.idStar1 !== 0) {
      return `/icon/${unitEntry.idStar1}.webp`;
    }
  }
  return '/icon/000001.webp';
};

export const getElementIconPath = (element: string): string => {
  const elementNames: { [key: string]: string } = {
    '火': 'fire', '水': 'water', '風': 'wind', '光': 'light', '闇': 'dark'
  };
  return `/othersIcon/${elementNames[element]}.png`;
};

export const getPositionIconPath = (position: string): string => {
  const positionIds: { [key: string]: string } = {
    '前衛': '1001', '中衛': '1002', '後衛': '1003'
  };
  return `/othersIcon/${positionIds[position]}.webp`;
};

const checkEffect = (effect: Effect, filter: SkillFilter): boolean => {
    const valueToTest = effect[filter.property as keyof Effect];
    const filterValue = filter.value;

    if (valueToTest === undefined) {
        if(filter.property === 'duration' && filterValue === null) {
            return valueToTest === null;
        }
        return false;
    }
    
    if (valueToTest === null) {
        return filterValue === null;
    }

    if (typeof valueToTest === 'string' && typeof filterValue === 'string') {
      const matchType = filter.matchType || 'contains';
      return matchType === 'exact' ? valueToTest === filterValue : valueToTest.includes(filterValue);
    }
    
    if (typeof valueToTest === 'number' && typeof filterValue === 'number') {
      return valueToTest === filterValue;
    }
    
    return false;
};

const katakanaToHiragana = (str: string) => {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
};


export const filterAndSortCharacters = (
  characters: Character[],
  allSkills: UnitSkills,
  filters: FilterOptions,
  searchTerm: string,
  sortType: SortType
): Character[] => {
  // ★ searchTermを一度だけ変換
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const hiraganaSearchTerm = katakanaToHiragana(lowerCaseSearchTerm);

  let filtered = characters.filter(character => {
    // ★ 名前検索フィルターを修正
    if (searchTerm) {
      const lowerCaseFullName = character.fullName.toLowerCase();
      const hiraganaFullName = katakanaToHiragana(lowerCaseFullName);
      // カタカナのまま、またはひらがなに変換したもののいずれかで一致すればOK
      if (
        !lowerCaseFullName.includes(lowerCaseSearchTerm) &&
        !hiraganaFullName.includes(hiraganaSearchTerm)
      ) {
        return false;
      }
    }

    // 基本フィルター
    if (filters.element.length > 0 && !filters.element.includes(character.attribute)) return false;
    if (filters.position.length > 0 && !filters.position.includes(character.position)) return false;
    if (filters.atkType.length > 0 && !filters.atkType.includes(character.type)) return false;
    if (filters.roles.length > 0 && !filters.roles.some(role => character.roles?.includes(role))) return false;

    // スキルフィルター
    if (filters.skillFilters.length > 0) {
      const charSkills = allSkills[character.fullName];
      
      // すべてのフィルター条件をANDでチェック
      return filters.skillFilters.every(filter => {
        // 詳細スキルデータがない場合、簡易説明でフォールバック
        if (!charSkills) {
            if (filter.property === 'description' && typeof filter.value === 'string') {
                const simpleSkillDesc = Object.values(character.skills).map(s => s.description).join(' ');
                return simpleSkillDesc.includes(filter.value);
            }
            return false; // 詳細データがない場合、description以外のフィルターはfalse
        }

        // キャラクターが持ついずれかのスキルがフィルター条件を満たせばOK (OR)
        return Object.values(charSkills).some(skillDetail => 
          skillDetail?.versions.some(version => 
            version.effects.some(effect => checkEffect(effect, filter))
          )
        );
      });
    }

    return true;
  });

  // ★ ソート処理
  if (sortType === 'name_asc') {
    filtered.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ja'));
  } else if (sortType === 'position') {
    filtered.sort((a, b) => {
        const indexA = positionOrder.indexOf(a.fullName);
        const indexB = positionOrder.indexOf(b.fullName);
        // positionOrderにないキャラは末尾に
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
  }
  // 'default'の場合はソートしない（元のJSONの順序）

  return filtered;
};