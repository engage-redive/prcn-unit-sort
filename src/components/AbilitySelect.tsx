import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Ability, Pokemon } from '../types';
import { ChevronDown } from 'lucide-react';

interface AbilitySelectProps {
  abilities?: Ability[];
  selected: Ability | null;
  onChange: (ability: Ability | null) => void;
  label: string;
  side: 'attacker' | 'defender';
  selectedPokemon?: Pokemon | null;
  idPrefix?: string;
  disabled?: boolean; // disabled prop を追加
}

const AbilitySelect: React.FC<AbilitySelectProps> = ({
  abilities = [],
  selected,
  onChange,
  label,
  side,
  selectedPokemon,
  idPrefix = 'ability-select',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const baseId = useMemo(() => `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}-${side}`, [idPrefix, label, side]);
  const buttonId = `${baseId}-button`;
  const listboxId = `${baseId}-listbox`;
  const getOptionId = (abilityId: string | number) => `${baseId}-option-${abilityId}`;

  const sortedAbilities = useMemo(() => {
    if (!Array.isArray(abilities)) return [];
    let baseFiltered = abilities.filter(ability => ability.side === side || ability.side === 'both');

    if (selectedPokemon?.abilities?.length) {
      const pokemonAbilityNamesEn = new Set(selectedPokemon.abilities.map(name => name.toLowerCase()));
      return [...baseFiltered].sort((a, b) => {
        const aIsPokemonAbility = pokemonAbilityNamesEn.has(a.nameEn?.toLowerCase() || '');
        const bIsPokemonAbility = pokemonAbilityNamesEn.has(b.nameEn?.toLowerCase() || '');
        if (aIsPokemonAbility && !bIsPokemonAbility) return -1;
        if (!aIsPokemonAbility && bIsPokemonAbility) return 1;
        return a.name.localeCompare(b.name, 'ja');
      });
    }
    return [...baseFiltered].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }, [abilities, side, selectedPokemon]);

  const options = useMemo(() => [
    { id: '__no-ability__', name: '特性なし', description: '', side: 'both' as const, nameEn: '' },
    ...sortedAbilities,
  ], [sortedAbilities]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      const initialIndex = selected 
        ? options.findIndex(opt => opt.id === selected.id) 
        : options.findIndex(opt => opt.id === '__no-ability__');
      setHighlightedIndex(initialIndex >= 0 ? initialIndex : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, selected, options]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const listItem = listRef.current.children[highlightedIndex] as HTMLLIElement | undefined;
      listItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  const handleSelectOption = (option: typeof options[0]) => {
    onChange(option.id === '__no-ability__' ? null : option as Ability);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelectOption(options[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Escape':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Home': event.preventDefault(); if (isOpen) setHighlightedIndex(0); break;
      case 'End': event.preventDefault(); if (isOpen) setHighlightedIndex(options.length - 1); break;
      case 'Tab': if (isOpen) setIsOpen(false); break;
      default: break;
    }
  };

  return (
    <div className="w-full">
      {label && <label id={`${baseId}-label`} className="block text-sm font-medium text-white mb-2">{label}</label>}
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className="relative w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white disabled:bg-gray-700/50 disabled:cursor-not-allowed"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${baseId}-label ${buttonId}`}
          aria-controls={isOpen ? listboxId : undefined}
          disabled={disabled}
        >
          <span className="block truncate">
            {selected ? selected.name : '特性なし'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 shadow-lg max-h-60 rounded-md overflow-y-auto focus:outline-none ring-1 ring-black ring-opacity-5">
            <ul
              ref={listRef}
              id={listboxId}
              tabIndex={-1}
              role="listbox"
              aria-labelledby={`${baseId}-label`}
              aria-activedescendant={highlightedIndex >= 0 ? getOptionId(options[highlightedIndex].id) : undefined}
              onKeyDown={handleKeyDown}
              className="py-1"
            >
              {options.map((ability, index) => (
                <li
                  key={ability.id}
                  id={getOptionId(ability.id)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors ${
                    highlightedIndex === index ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                  role="option"
                  aria-selected={selected?.id === ability.id}
                  onClick={() => handleSelectOption(ability)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex flex-col">
                    <span className={`block truncate text-white ${
                       selected?.id === ability.id ? 'font-semibold' : 'font-normal'
                    }`}>
                      {ability.name}
                    </span>
                    {ability.id !== '__no-ability__' && ability.description && (
                      <span className="text-gray-400 text-xs mt-0.5">
                        {ability.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbilitySelect;