// MoveSelect.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Move, Pokemon, PokemonType } from '../types'; // パスをプロジェクトに合わせて調整
import { Search, X } from 'lucide-react';
import { getTypeColor, getTypeNameJp } from '../utils/uiHelpers'; 

// Helper function to convert Katakana to Hiragana
const toHiragana = (str: string): string => {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => { // Matches Katakana characters (ァ-ヶ)
    const charCode = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(charCode);
  });
};

// ─── ギミック切り替えアイコンボタン ───
interface GimmickButtonProps {
  id: string;
  iconSrc: string;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  glowColor?: string;
}

const GimmickButton: React.FC<GimmickButtonProps> = ({
  id, iconSrc, label, active, disabled, onClick, glowColor = 'rgba(255,255,255,0.7)',
}) => {
  return (
    <button
      id={id}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={[
        'relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'cursor-pointer hover:scale-110 active:scale-95',
        active && !disabled
          ? 'bg-white/15'
          : '',
      ].join(' ')}
      style={active && !disabled ? { boxShadow: `0 0 8px 2px ${glowColor}` } : undefined}
    >
      <img
        src={iconSrc}
        alt={label}
        className={[
          'w-6 h-6 object-contain transition-all duration-150',
          !active || disabled ? 'grayscale opacity-60' : '',
        ].join(' ')}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent && !parent.querySelector('.icon-fallback')) {
            const span = document.createElement('span');
            span.className = 'icon-fallback text-[9px] text-gray-400 font-bold text-center leading-tight';
            span.textContent = label;
            parent.appendChild(span);
          }
        }}
      />
    </button>
  );
};

interface MoveSelectProps {
  moves: Move[];
  selected: Move | null;
  onChange: (move: Move | null) => void;
  label: string;
  onToggleTera: () => void;
  currentAttackerTeraType: PokemonType | null;
  isStellar: boolean;
  onToggleStellar: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  loadedMoves?: (Move | null)[] | null; // チームからロードされた技
  currentAttackerPokemon?: Pokemon | null;
  /** メガシンカ状態かどうか（true時はZ・テラ・ステラを無効化） */
  isMega?: boolean;
}

const MoveSelect: React.FC<MoveSelectProps> = ({
  moves,
  selected,
  onChange,
  label,
  onToggleTera,
  currentAttackerTeraType,
  isStellar,
  onToggleStellar,
  disabled = false,
  className,
  placeholder = "わざを検索または選択...",
  loadedMoves,
  isMega = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // ------------------- ▼▼▼ 変更箇所 1.1 (prevSelectedOnFocus state 追加) ▼▼▼ -------------------
  const [prevSelectedOnFocus, setPrevSelectedOnFocus] = useState<Move | null>(null);
  // ------------------- ▲▲▲ 変更箇所 1.1 ▲▲▲ -------------------

  const dropdownRef = useRef<HTMLDivElement>(null); // pcDropdownRef を dropdownRef に変更
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);


  const baseId = useMemo(() => `move-select-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);
  const getOptionId = useCallback((moveId: string | number) => `${baseId}-option-${moveId}`, [baseId]);

  useEffect(() => {
    if (selected) {
      setInputValue(selected.name);
    } else {
      // ------------------- ▼▼▼ 変更箇所 1.2 (inputValueが空の時、onChange(null)を呼ばないように) ▼▼▼ -------------------
      // ここでinputValueが空の時にonChange(null)を呼ぶと、意図せず選択が解除されることがあるため、
      // onChange(null)はユーザーの明示的なクリア操作(handleInputChange, clearInputAndSearch)に委ねる
      if (inputValue !== '') { // 既に空の場合は何もしない
        setInputValue('');
      }
      // ------------------- ▲▲▲ 変更箇所 1.2 ▲▲▲ -------------------
    }
  }, [selected]);

  const filteredMoves = useMemo(() => {
    const searchTermLower = inputValue.toLowerCase();
    const searchTermHiragana = toHiragana(searchTermLower);

    const nonStatusMoves = moves.filter(move => move.category !== 'status');

    let results: Move[];

    const filterFn = (move: Move) => {
        if (!searchTermLower) return true;

        const moveNameJp = move.name;
        const moveNameJpLower = moveNameJp.toLowerCase();
        const moveNameJpHiragana = toHiragana(moveNameJp);
        const moveNameEnLower = (move as any).nameEn?.toLowerCase() || '';
        const typeOriginalJp = getTypeNameJp(move.type);
        const typeNameJpLower = typeOriginalJp.toLowerCase();
        const typeNameJpHiragana = toHiragana(typeOriginalJp);
        const moveTypeRawLower = move.type.toLowerCase();

        if (moveNameJpLower.includes(searchTermLower) || moveNameJpHiragana.includes(searchTermHiragana)) return true;
        if (moveNameEnLower && moveNameEnLower.includes(searchTermLower)) return true;
        if (typeNameJpLower.includes(searchTermLower) || typeNameJpHiragana.includes(searchTermHiragana)) return true;
        if (moveTypeRawLower.includes(searchTermLower)) return true;

        if (move.isTeraBlast) {
          const teraburstJpLower = "テラバースト".toLowerCase();
          const teraburstJpHiragana = toHiragana("テラバースト");
          const teraburstEnLower = "terablast".toLowerCase();
          if (teraburstJpLower.includes(searchTermLower) || teraburstJpHiragana.includes(searchTermHiragana) || teraburstEnLower.includes(searchTermLower)) {
            return true;
          }
        }
        return false;
    };

    if (searchTermLower) {
        results = nonStatusMoves.filter(filterFn);
    } else {
        results = [...nonStatusMoves];
    }
    
    if (loadedMoves && loadedMoves.length > 0) {
        const validLoadedMoves = loadedMoves.filter(m => m !== null) as Move[];
        const loadedMoveIdsInOrder = validLoadedMoves.map(m => m.id);
        const loadedMoveIdSet = new Set(loadedMoveIdsInOrder);

        results.sort((a, b) => {
            const aIsLoaded = loadedMoveIdSet.has(a.id);
            const bIsLoaded = loadedMoveIdSet.has(b.id);

            if (aIsLoaded && !bIsLoaded) return -1;
            if (!aIsLoaded && bIsLoaded) return 1;
            
            if (aIsLoaded && bIsLoaded) {
                const indexOfA = loadedMoveIdsInOrder.indexOf(a.id);
                const indexOfB = loadedMoveIdsInOrder.indexOf(b.id);
                return indexOfA - indexOfB;
            }
            
            return a.name.localeCompare(b.name, 'ja');
        });
    } else {
        results.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    }

    return results;
  }, [moves, inputValue, loadedMoves]);

  useEffect(() => {
    if (!isOpen || disabled) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // ------------------- ▼▼▼ 変更箇所 2.1 (モバイル判定削除) ▼▼▼ -------------------
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          inputRef.current && !inputRef.current.contains(target)) {
        // typeof window !== 'undefined' && window.innerWidth >= 640 の条件を削除
        setIsOpen(false);
        if (selected) setInputValue(selected.name); else setInputValue('');
      }
      // ------------------- ▲▲▲ 変更箇所 2.1 ▲▲▲ -------------------
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, selected, disabled]);

  useEffect(() => {
    if (isOpen && !disabled) {
        // ------------------- ▼▼▼ 変更箇所 2.2 (focusDelayのモバイル判定削除) ▼▼▼ -------------------
        const focusDelay = 50; // 常に同じ遅延 (または0)
        // ------------------- ▲▲▲ 変更箇所 2.2 ▲▲▲ -------------------
        setTimeout(() => {
            inputRef.current?.focus();
        }, focusDelay);
        setHighlightedIndex(filteredMoves.length > 0 ? 0 : -1);
    } else {
        setHighlightedIndex(-1);
    }
  }, [isOpen, disabled, filteredMoves]); // filteredMovesを依存配列に追加

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current && filteredMoves[highlightedIndex]) {
      const optionId = getOptionId(filteredMoves[highlightedIndex].id);
      const listItem = listRef.current.querySelector(`#${CSS.escape(optionId)}`) as HTMLLIElement | undefined;
      listItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex, filteredMoves, getOptionId]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen && !disabled) {
      setIsOpen(true);
    }
    if (e.target.value === '') {
      onChange(null); // ユーザーが手動でクリアした場合のみ選択を解除
    }
    setHighlightedIndex(filteredMoves.length > 0 ? 0 : -1);
  };

  const handleMoveSelect = (move: Move) => {
    onChange(move);
    setInputValue(move.name);
    setIsOpen(false);
    // ------------------- ▼▼▼ 変更箇所 1.3 (prevSelectedOnFocus クリア) ▼▼▼ -------------------
    setPrevSelectedOnFocus(null);
    // ------------------- ▲▲▲ 変更箇所 1.3 ▲▲▲ -------------------

    // ------------------- ▼▼▼ 変更箇所 2.3 (モバイル判定とblur削除) ▼▼▼ -------------------
    // モバイル用のblur処理は不要になったため削除
    // ------------------- ▲▲▲ 変更箇所 2.3 ▲▲▲ -------------------
  };

  const clearInputAndSearch = () => {
    onChange(null);
    setInputValue('');
    // ------------------- ▼▼▼ 変更箇所 1.4 (prevSelectedOnFocus クリア) ▼▼▼ -------------------
    setPrevSelectedOnFocus(null);
    // ------------------- ▲▲▲ 変更箇所 1.4 ▲▲▲ -------------------
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen && !disabled) {
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredMoves.length) {
          handleMoveSelect(filteredMoves[highlightedIndex]);
        } else if (isOpen && filteredMoves.length === 1) {
          handleMoveSelect(filteredMoves[0]);
        } else if (!isOpen && inputValue && filteredMoves.length > 0) {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (filteredMoves.length > 0) {
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => (prev + 1) % filteredMoves.length);
            listRef.current?.focus();
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (filteredMoves.length > 0) {
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => (prev - 1 + filteredMoves.length) % filteredMoves.length);
            listRef.current?.focus();
          }
        }
        break;
      // ------------------- ▼▼▼ 変更箇所 1.5 (Escapeキーの挙動変更) ▼▼▼ -------------------
      case 'Escape':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          if (prevSelectedOnFocus) {
            onChange(prevSelectedOnFocus); 
            setInputValue(prevSelectedOnFocus.name);
          } else if (selected) { // prevSelectedOnFocusがない場合(通常ありえないがフォールバック)
            setInputValue(selected.name);
          } else {
            setInputValue('');
          }
          setPrevSelectedOnFocus(null);
        }
        // inputRef.current?.blur(); // blurは最後ではなく、必要なら呼び出し側で
        break;
      // ------------------- ▲▲▲ 変更箇所 1.5 ▲▲▲ -------------------
      default:
        break;
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (disabled) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredMoves.length) {
          handleMoveSelect(filteredMoves[highlightedIndex]);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (filteredMoves.length > 0) {
          setHighlightedIndex(prev => (prev + 1) % filteredMoves.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (filteredMoves.length > 0) {
          setHighlightedIndex(prev => (prev - 1 + filteredMoves.length) % filteredMoves.length);
        }
        break;
      // ------------------- ▼▼▼ 変更箇所 1.6 (リストでのEscapeキーの挙動変更) ▼▼▼ -------------------
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        // inputValue は現在の selected に基づいて復元
        if (selected) {
          setInputValue(selected.name);
        } else {
          setInputValue('');
        }
        // prevSelectedOnFocus はここでは触らない (inputのEscapeで処理)
        inputRef.current?.focus();
        break;
      // ------------------- ▲▲▲ 変更箇所 1.6 ▲▲▲ -------------------
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            inputRef.current?.focus();
        }
        break;
    }
  };

  const renderMoveItems = () => (
    <>
      {filteredMoves.length > 0 ? (
        filteredMoves.map((move, index) => (
          <li
            key={move.id}
            id={getOptionId(move.id)}
            className={`cursor-pointer select-none relative py-2.5 sm:py-2 pl-3 pr-4 transition-colors group rounded-md
              ${highlightedIndex === index ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
            onClick={() => handleMoveSelect(move)}
            onMouseEnter={() => {
              // ------------------- ▼▼▼ 変更箇所 2.4 (onMouseEnterのモバイル判定削除) ▼▼▼ -------------------
              // if (typeof window !== 'undefined' && window.innerWidth >= 640) { // モバイル判定削除
                setHighlightedIndex(index);
              // }
              // ------------------- ▲▲▲ 変更箇所 2.4 ▲▲▲ -------------------
            }}
            role="option"
            aria-selected={selected?.id === move.id || highlightedIndex === index}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className={`font-medium block truncate`}>
                  {move.name}
                </span>
                <span className={`text-sm block truncate ${highlightedIndex === index ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}`}>
                  {move.category === "physical" ? "物理" : move.category === "special" ? "特殊" : "変化"} | 威力: {move.power === undefined || move.power === null ? '—' : move.power}
                </span>
              </div>
              <span
                className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white self-center"
                style={{ backgroundColor: getTypeColor(move.type) }}
              >
                {getTypeNameJp(move.type)}
              </span>
            </div>
          </li>
        ))
      ) : (
        <li className="text-center py-4 text-gray-400 px-3">
          {inputValue ? "該当するわざが見つかりません。" : "検索語を入力または選択してください。"}
        </li>
      )}
    </>
  );

  // ------------------- ▼▼▼ 変更箇所 2.5 (renderSearchInputComponentのisMobileModalInput引数削除) ▼▼▼ -------------------
  const renderSearchInputComponent = () => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <input
            id={`move-select-input-${label}`} // IDを統一
            ref={inputRef}
            type="text"
            className={`w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-10 pr-10 py-2.5 text-left sm:text-sm text-white
            ${disabled ? 'cursor-not-allowed bg-gray-700 placeholder-gray-500' : 'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400'}`}
            value={inputValue}
            onChange={handleInputChange}
            // ------------------- ▼▼▼ 変更箇所 1.7 (onFocusの挙動変更) ▼▼▼ -------------------
            onFocus={() => {
              if (!disabled) {
                if (!isOpen) {
                  setPrevSelectedOnFocus(selected);
                  setInputValue(''); 
                  // handleInputChange('')が呼ばれ、onChange(null)がトリガーされることを意図
                  setIsOpen(true);
                }
              }
            }}
            // ------------------- ▲▲▲ 変更箇所 1.7 ▲▲▲ -------------------
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            aria-autocomplete="list"
            aria-controls={isOpen ? `move-select-listbox-${label}` : undefined}
            aria-expanded={isOpen}
            aria-activedescendant={isOpen && highlightedIndex >= 0 && filteredMoves[highlightedIndex] ? getOptionId(filteredMoves[highlightedIndex].id) : undefined}
        />
        {inputValue && !disabled && (
        <button
            type="button"
            onClick={clearInputAndSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
            aria-label="入力をクリアして再検索"
        >
            <X className="h-4 w-4" />
        </button>
        )}
    </div>
  );
  // ------------------- ▲▲▲ 変更箇所 2.5 ▲▲▲ -------------------

  return (
    <div className={`w-full ${className || ''} ${disabled ? 'opacity-70' : ''}`}>
      <div className="relative">
        {renderSearchInputComponent()}

        {/* ------------------- ▼▼▼ 変更箇所 2.6 (モバイル用モーダル削除、PC用ドロップダウンを常に表示) ▼▼▼ ------------------- */}
        {isOpen && !disabled && (
            <div
              ref={dropdownRef} // dropdownRefを使用
              className={`
                absolute z-40 mt-1 w-full bg-gray-800 shadow-lg max-h-80 rounded-md ring-1 ring-black ring-opacity-5 
                flex flex-col overflow-hidden 
              `} // hidden sm:flex を削除し、flex flex-col overflow-hidden のみ残す (または block)
            >
              {/* PC版ドロップダウン内に検索入力は不要 (inputは外にあるため)
                  ただし、元コードでPC版に検索入力があったなら、その構造を維持。
                  現状のコードではPC版ドロップダウン内に検索入力はなかったので、リストのみ。
              */}
              <ul
                ref={listRef}
                id={`move-select-listbox-${label}`} // IDを統一
                tabIndex={-1}
                role="listbox"
                aria-label={`${label || 'わざ'}の候補`} // ラベルを統一
                aria-activedescendant={highlightedIndex >= 0 && filteredMoves[highlightedIndex] ? getOptionId(filteredMoves[highlightedIndex].id) : undefined}
                onKeyDown={handleListKeyDown}
                className="p-2 overflow-y-auto flex-grow space-y-1"
              >
                {renderMoveItems()}
              </ul>
            </div>
        )}
        {/* ------------------- ▲▲▲ 変更箇所 2.6 ▲▲▲ ------------------- */}
      </div>

      {selected && !disabled && (
        <div className="mt-2 flex flex-wrap justify-between items-center gap-x-2 gap-y-1 w-full">
          {/* 左: 威力・タイプ */}
          <div className="flex items-center gap-2 text-xs text-gray-300 min-w-0">
            <span>威力:</span>
            <span className="text-white font-medium">{selected.power === undefined || selected.power === null ? '—' : selected.power}</span>
            <span>|</span>
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
              style={{ backgroundColor: getTypeColor(selected.type) }}
            >
              {getTypeNameJp(selected.type)}
            </span>
            {selected.isTeraBlast && isStellar && <span className="text-pink-400">（ステラ）</span>}
            {selected.isTeraBlast && currentAttackerTeraType && !isStellar && (
              <span className="text-blue-400">（{getTypeNameJp(currentAttackerTeraType)} テラバースト）</span>
            )}
          </div>

          {/* 右: ギミックアイコン群 (Z / ダイマ / テラ / ステラ) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <GimmickButton
              id={`zmove-toggle-${baseId}`}
              iconSrc="/images/z_move_icon.png"
              label="Z技"
              active={false}
              disabled={true}
              onClick={() => {}}
              glowColor="rgba(255,220,50,0.7)"
            />
            <GimmickButton
              id={`dmax-toggle-${baseId}`}
              iconSrc="/images/Gigamax_icon.png"
              label="ダイマックス"
              active={false}
              disabled={true}
              onClick={() => {}}
              glowColor="rgba(255,50,255,0.7)"
            />
            {/* テラスタル */}
            <GimmickButton
              id={`terastal-toggle-${baseId}`}
              iconSrc="/images/Terastal_icon.png"
              label="テラスタル"
              active={currentAttackerTeraType !== null && !isStellar}
              disabled={isMega}
              onClick={() => !isMega && onToggleTera()}
              glowColor="rgba(100,200,255,0.8)"
            />
            {/* ステラ */}
            <GimmickButton
              id={`stellar-toggle-${baseId}`}
              iconSrc="/images/Stellar_icon.png"
              label="ステラ"
              active={isStellar}
              disabled={isMega}
              onClick={() => !isMega && onToggleStellar()}
              glowColor="rgba(220,100,255,0.8)"
            />
          </div>
        </div>
      )}
      {selected && selected.description && !disabled && (
          <p className="mt-1 text-xs italic text-gray-400">{selected.description}</p>
      )}
    </div>
  );
};

export default MoveSelect;