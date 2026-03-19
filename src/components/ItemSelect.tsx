import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Item } from '../types';
import { ChevronDown } from 'lucide-react';

interface ItemSelectProps {
  items: Item[];
  selected: Item | null;
  onChange: (item: Item | null) => void;
  label: string;
  side: 'attacker' | 'defender' | 'both';
  idPrefix?: string; // Optional prefix for generating unique IDs
  disabled?: boolean;
}

const ItemSelect: React.FC<ItemSelectProps> = ({
  items = [],
  selected,
  onChange,
  label,
  side,
  idPrefix = 'item-select',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const baseId = useMemo(() => `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`, [idPrefix, label]);
  const buttonId = `${baseId}-button`;
  const listboxId = `${baseId}-listbox`;
  const getOptionId = (itemId: string | number) => `${baseId}-option-${itemId}`;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = useMemo(() =>
    Array.isArray(items)
      ? items.filter(item => item.effect?.side === side || item.effect?.side === 'both')
      : [],
    [items, side]
  );

  const options = useMemo(() => [
    { id: '__no-item__', name: '持ち物', description: 'No item selected.' }, // Placeholder for "No Item"
    ...filteredItems,
  ], [filteredItems]);

  useEffect(() => {
    if (isOpen) {
      let initialIndex = 0;
      if (selected) {
        const foundIndex = options.findIndex(opt => opt.id === selected.id);
        if (foundIndex !== -1) {
          initialIndex = foundIndex;
        }
      } else {
        // If "No Item" is selected (selected is null), it's the first option
        initialIndex = options.findIndex(opt => opt.id === '__no-item__');
      }
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

  const handleSelectOption = (item: Item | null) => {
    onChange(item);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            const currentOption = options[highlightedIndex];
            handleSelectOption(currentOption.id === '__no-item__' ? null : currentOption as Item);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
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
        event.preventDefault();
        if (isOpen) setHighlightedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        if (isOpen) setHighlightedIndex(options.length - 1);
        break;
      case 'Tab':
        if (isOpen) setIsOpen(false); // Close on Tab
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="w-full mb-4">
      <label id={`${baseId}-label`} className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className="relative w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${baseId}-label ${buttonId}`}
          aria-controls={isOpen ? listboxId : undefined}
          disabled={disabled}
        >
          <span className="block truncate">
            {selected ? selected.name : '持ち物無し'}
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
              tabIndex={-1} // Make it focusable for key events if needed, though button handles most
              role="listbox"
              aria-labelledby={`${baseId}-label`}
              aria-activedescendant={highlightedIndex >= 0 ? getOptionId(options[highlightedIndex].id) : undefined}
              onKeyDown={handleKeyDown} // Allow key navigation within the list itself
              className="py-1"
            >
              {options.map((item, index) => (
                <li
                  key={item.id}
                  id={getOptionId(item.id)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors ${
                    highlightedIndex === index ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                  role="option"
                  aria-selected={
                    item.id === '__no-item__' 
                      ? selected === null 
                      : selected?.id === item.id
                  }
                  onClick={() => handleSelectOption(item.id === '__no-item__' ? null : item as Item)}
                  onMouseEnter={() => setHighlightedIndex(index)} // Optional: highlight on mouse enter
                >
                  <div className="flex flex-col">
                    <span className={`text-white font-medium block truncate ${
                       (item.id === '__no-item__' ? selected === null : selected?.id === item.id) ? 'font-semibold' : 'font-normal'
                    }`}>
                      {item.name}
                    </span>
                    {item.id !== '__no-item__' && item.description && (
                      <span className="text-gray-400 text-sm">
                        {item.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {selected && (
        <div className="mt-2 text-sm text-gray-300 italic">
          {selected.description}
        </div>
      )}
    </div>
  );
};

export default ItemSelect;