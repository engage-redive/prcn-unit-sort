import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Pokemon } from '../types';
import { ChevronDown, Search } from 'lucide-react';
import { getTypeNameJp } from '../utils/uiHelpers';

const toHiragana = (str: string): string => {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const charCode = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(charCode);
  });
};

interface PokemonSelectProps {
  pokemon?: Pokemon[];
  selected: Pokemon | null;
  onChange: (pokemon: Pokemon) => void;
  label: string;
  idPrefix?: string;
  disabled?: boolean;
}

const PokemonSelect: React.FC<PokemonSelectProps> = ({
  pokemon = [],
  selected,
  onChange,
  label,
  idPrefix = 'pokemon-select',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // pcDropdownRef を dropdownRef に変更
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const baseId = useMemo(() => `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`, [idPrefix, label]);
  const buttonId = `${baseId}-button`;
  const listboxId = `${baseId}-listbox`;
  const searchId = `${baseId}-search`;

  const getOptionId = useCallback((pokemonName: string) => {
    const sanitizedName = pokemonName
      .toLowerCase()
      .replace(/\s+/g, '-') // 空白をハイフンに
      .replace(/[()（）]/g, '') // 括弧を除去
      .replace(/[^a-z0-9ぁ-んァ-ンー\-]/gi, ''); // 英数字、ひらがな、カタカナ、ハイフン以外を除去 (より安全に)
    return `${baseId}-option-${sanitizedName}`;
  }, [baseId]);
  
  const uniquePokemonList = useMemo(() => {
    if (!pokemon || pokemon.length === 0) return [];
    const seenNames = new Set<string>();
    const result: Pokemon[] = [];
    for (const p of pokemon) {
      if (p && typeof p.name !== 'undefined' && !seenNames.has(p.name)) {
        seenNames.add(p.name);
        result.push(p);
      }
    }
    return result;
  }, [pokemon]);
  
  const filteredPokemon = useMemo(() => {
    if (!searchTerm) return uniquePokemonList;

    const searchLower = searchTerm.toLowerCase();
    const termAsHiragana = toHiragana(searchTerm);

    return uniquePokemonList.filter(p => {
      const nameHiragana = toHiragana(p.name);
      const nameEnLower = (p as any).nameEn?.toLowerCase() || '';
      
      if ((p as any).nameEn) {
        if (nameEnLower.includes(searchLower)) {
          return true;
        }
      }
      if (nameHiragana.startsWith(termAsHiragana)) {
        return true;
      }
      return false;
    });
  }, [uniquePokemonList, searchTerm]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // モバイル判定 (window.innerWidth >= 640) を削除
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50); // 遅延は固定値または0に
      
      if (selected) {
        const selectedIndex = filteredPokemon.findIndex(p => p.name === selected.name);
        setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : (filteredPokemon.length > 0 ? 0 : -1));
      } else {
        setHighlightedIndex(filteredPokemon.length > 0 ? 0 : -1);
      }
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, selected, filteredPokemon]);
  
  useEffect(() => {
    if (isOpen) {
        setHighlightedIndex(filteredPokemon.length > 0 ? 0 : -1);
    }
  }, [searchTerm, isOpen, filteredPokemon]); // filteredPokemonを依存配列に追加

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current && filteredPokemon.length > 0 && filteredPokemon[highlightedIndex]) {
      const optionId = getOptionId(filteredPokemon[highlightedIndex].name);
      const listItem = listRef.current.querySelector(`#${CSS.escape(optionId)}`) as HTMLLIElement | undefined;
      listItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex, filteredPokemon, getOptionId]);

  const handleSelectPokemon = (p: Pokemon) => {
    onChange(p);
    setIsOpen(false);
    setSearchTerm('');
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < filteredPokemon.length) {
            handleSelectPokemon(filteredPokemon[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredPokemon.length > 0) {
          setHighlightedIndex(prev => (prev + 1) % filteredPokemon.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredPokemon.length > 0) {
          setHighlightedIndex(prev => (prev - 1 + filteredPokemon.length) % filteredPokemon.length);
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Home':
         if (isOpen && filteredPokemon.length > 0) {
            event.preventDefault();
            setHighlightedIndex(0);
        }
        break;
      case 'End':
        if (isOpen && filteredPokemon.length > 0) {
            event.preventDefault();
            setHighlightedIndex(filteredPokemon.length - 1);
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  const handleSearchInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
     switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredPokemon.length) {
          handleSelectPokemon(filteredPokemon[highlightedIndex]);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (filteredPokemon.length > 0) {
          setHighlightedIndex(prev => (prev + 1) % filteredPokemon.length);
          listRef.current?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (filteredPokemon.length > 0) {
          setHighlightedIndex(prev => (prev - 1 + filteredPokemon.length) % filteredPokemon.length);
          listRef.current?.focus();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const renderListItems = () => (
    <>
      {filteredPokemon.length > 0 ? filteredPokemon.map((p, index) => (
        <li
          key={p.name}
          id={getOptionId(p.name)}
          className={`cursor-pointer select-none relative rounded-md transition-colors 
            py-3 sm:py-2 pl-4 sm:pl-3 pr-9
            ${highlightedIndex === index ? 'bg-gray-700 text-white' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}
          role="option"
          aria-selected={(selected?.name === p.name) || highlightedIndex === index}
          onClick={() => handleSelectPokemon(p)}
          onMouseEnter={() => setHighlightedIndex(index)}
        >
          <div className="flex items-center">
            <span className={`font-medium block truncate ${(selected?.name === p.name) ? 'font-semibold' : 'font-normal'}`}>
              {p.name}
            </span>
            {(p as any).types && Array.isArray((p as any).types) && (
              <span className="ml-2 flex-shrink-0 flex">
                {(p as any).types.map((type: string) => (
                  <span
                    key={type}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${type.toLowerCase()} text-white mr-1`}
                  >
                    {getTypeNameJp(type)}
                  </span>
                ))}
              </span>
            )}
          </div>
        </li>
      )) : (
        <li className="text-center py-4 text-gray-400 px-3">
          No Pokémon found
        </li>
      )}
    </>
  );

  const renderSearchInput = () => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
      <input
        ref={searchInputRef}
        id={searchId}
        type="text"
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 bg-gray-700 rounded-md leading-5 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
        placeholder="Search Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearchInputKeyDown}
        aria-label="Search Pokémon"
        aria-controls={listboxId}
        aria-autocomplete="list"
      />
    </div>
  );

  return (
    <div className="w-full">
      <label id={`${baseId}-label`} className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className={`w-full bg-gray-700 border ${isOpen ? 'border-blue-500' : 'border-gray-600'} rounded-md py-1.5 pl-3 pr-8 flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${baseId}-label ${buttonId}`}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={isOpen && highlightedIndex >= 0 && filteredPokemon.length > 0 && filteredPokemon[highlightedIndex] ? getOptionId(filteredPokemon[highlightedIndex].name) : undefined}
        >
          <span className="block truncate">
            {selected ? selected.name : 'Select Pokémon'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <>
            {/* Mobile: Fullscreen Search Interface (削除) */}
            {/* <div ref={mobileViewRef} ... > ... </div> */}

            {/* PC: Dropdown Interface (これが常に使われる) */}
            <div
              ref={dropdownRef} // dropdownRefを使用
              // classNameの `hidden sm:flex` を削除し、常に表示されるようにする
              className="absolute z-40 mt-1 w-full bg-gray-800 shadow-lg max-h-80 rounded-md ring-1 ring-black ring-opacity-5 flex flex-col overflow-hidden"
            >
              <div className="sticky top-0 z-10 bg-gray-800 p-2 border-b border-gray-700">
                {renderSearchInput()}
              </div>
              <ul
                ref={listRef} 
                id={listboxId} // IDは共通
                tabIndex={-1}
                role="listbox"
                aria-labelledby={`${baseId}-label`}
                aria-activedescendant={highlightedIndex >= 0 && filteredPokemon.length > 0 && filteredPokemon[highlightedIndex] ? getOptionId(filteredPokemon[highlightedIndex].name) : undefined}
                onKeyDown={handleKeyDown}
                className="p-2 overflow-y-auto flex-grow space-y-1"
              >
                {renderListItems()}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PokemonSelect;