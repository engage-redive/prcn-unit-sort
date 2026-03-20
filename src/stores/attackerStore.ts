// src/stores/attackerStore.ts
import { create } from 'zustand';
import type {
  AttackerState, Pokemon, Move, StatCalculation, NatureModifier,
  MoveCategory,
  AttackerStateSnapshotForLog, StatCalculationSnapshot, MoveDynamicContext, Nature, DefenderState,
} from '../types';
import { pokedex } from '../data/pokedex';
import { moves as allMovesData } from '../data/moves'; // 'moves' を 'allMovesData' にリネームして使用
import { items } from '../data/items';
import { abilities } from '../data/abilities';
import { natures } from '../data/natures';
import { popularMoves } from '../data/popularMoves'; // ★ popularMoves をインポート
import { getEffectiveMoveProperties } from '../utils/moveEffects';
import { useGlobalStateStore } from './globalStateStore';
import { useDefenderStore } from './defenderStore';
import type { TeamMember } from './teamStore';


// ユーティリティ関数
const calculateHp = (base: number, statPoints: number): number => {
  if (base <= 0) return 0;
  if (base === 1) return 1; // ヌケニン対応
  return Math.floor(base + 75 + statPoints);
};
const calculateBaseStatValue = (base: number, statPoints: number, nature: NatureModifier): number => {
  if (!base || base <= 0) return 0;
  let stat = Math.floor(base + 20 + statPoints);
  stat = Math.floor(stat * nature);
  return stat;
};
const calculateFinalStatWithRank = (base: number, statPoints: number, nature: NatureModifier, rank: number): number => {
  let baseStatVal = calculateBaseStatValue(base, statPoints, nature);
  if (rank !== 0) {
    const rankMultiplier = rank > 0 ? (2 + rank) / 2 : 2 / (2 - rank);
    baseStatVal = Math.floor(baseStatVal * rankMultiplier);
  }
  return baseStatVal;
};
const findClosestStatPointForBaseValue = (targetBaseValue: number, pokemonSpeciesStat: number, nature: NatureModifier): number => {
  if (pokemonSpeciesStat <= 0 || targetBaseValue <= 0) return 0;
  const statAt0Points = calculateBaseStatValue(pokemonSpeciesStat, 0, nature);
  if (targetBaseValue <= statAt0Points) return 0;
  const statAt32Points = calculateBaseStatValue(pokemonSpeciesStat, 32, nature);
  if (targetBaseValue >= statAt32Points) return 32;
  let closestPoints = 0;
  let smallestDiff = Infinity;
  for (let points = 0; points <= 32; points += 1) {
    const calculatedStat = calculateBaseStatValue(pokemonSpeciesStat, points, nature);
    const diff = Math.abs(calculatedStat - targetBaseValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestPoints = points;
    } else if (diff === smallestDiff) {
      closestPoints = Math.min(closestPoints, points);
    }
  }
  return closestPoints;
};

const getNatureModifierValueFromDetails = (natureDetails: Nature | undefined, statField: 'attack' | 'specialAttack' | 'defense' | 'specialDefense' | 'speed'): NatureModifier => {
  if (!natureDetails) return 1.0;
  if (natureDetails.increasedStat === statField) return 1.1;
  if (natureDetails.decreasedStat === statField) return 0.9;
  return 1.0;
};
// (ここまでユーティリティ関数)

const createInitialAttackerState = (): AttackerState => {
  const initialPokemon = pokedex.find(p => p.name === "カイリュー") || pokedex[0]; // 初期ポケモン

  // ★ 初期技を popularMoves から取得
  let initialMove: Move | null = null;
  const popularMoveNamesForInitialPokemon = popularMoves[initialPokemon.name];
  if (popularMoveNamesForInitialPokemon && popularMoveNamesForInitialPokemon.length > 0) {
    for (const moveName of popularMoveNamesForInitialPokemon) {
      const foundMove = allMovesData.find(m => m.name === moveName && m.category !== 'status');
      if (foundMove) {
        initialMove = foundMove;
        break;
      }
    }
  }
  // フォールバックとして、もし popularMoves に技がなければ、全技リストから何か一つ (例: 最初の攻撃技)
  if (!initialMove) {
    initialMove = allMovesData.find(m => m.category !== 'status') || allMovesData[0] || null;
  }
  // ★ ここまで初期技設定

  const initialAbility = abilities.find(a => a.name.toLowerCase() === initialPokemon.abilities[0].toLowerCase()) || null;

  const createStat = (base: number, statPoints: number = 0): StatCalculation => {
    const final = calculateFinalStatWithRank(base, statPoints, 1.0, 0);
    return { base, statPoints, nature: 1.0, rank: 0, final };
  };

  const attackStat = createStat(initialPokemon.baseStats.attack, 0); // 初期ステータスポイントは0とする
  const specialAttackStat = createStat(initialPokemon.baseStats.specialAttack);
  const defenseStat = createStat(initialPokemon.baseStats.defense);
  const specialDefenseStat = createStat(initialPokemon.baseStats.specialDefense);
  const speedStat = createStat(initialPokemon.baseStats.speed);
  const hpStatPoints = 0;
  const actualMaxHp = calculateHp(initialPokemon.baseStats.hp, hpStatPoints);

  return {
    pokemon: initialPokemon,
    move: initialMove, // ★ 初期技を設定
    effectiveMove: null,
    item: null,
    ability: initialAbility,
    attackStat, specialAttackStat, defenseStat, specialDefenseStat, speedStat,
    attackInputValue: attackStat.final.toString(),
    specialAttackInputValue: specialAttackStat.final.toString(),
    defenseInputValue: defenseStat.final.toString(),
    specialDefenseInputValue: specialDefenseStat.final.toString(),
    speedInputValue: speedStat.final.toString(),
    hpStatPoints, actualMaxHp, currentHp: actualMaxHp,
    teraType: null, loadedTeraType: null, isStellar: false,
    isBurned: false, isCritical: initialMove?.alwaysCrit === true, hasHelpingHand: false, hasFlowerGift: false,
    isEnabled: true,
    teraBlastUserSelectedCategory: 'auto', teraBlastDeterminedType: null, teraBlastDeterminedCategory: null,
    starstormDeterminedCategory: null, photonGeyserDeterminedCategory: null,
    selectedHitCount: (typeof initialMove?.multihit === 'number') ? initialMove.multihit : (initialMove?.multihit === '2-5' ? 2 : null),
    protosynthesisBoostedStat: initialAbility?.id === 'protosynthesis' ? 'attack' : null,
    protosynthesisManualTrigger: false,
    quarkDriveBoostedStat: initialAbility?.id === 'quark_drive' ? 'attack' : null,
    quarkDriveManualTrigger: false,
    moveUiOptionStates: {}, abilityUiFlags: {}, loadedMoves: null,
    variableHitStates: initialMove?.variablePowers ? initialMove.variablePowers.map(() => true) : [],
  };
};

interface AttackerStore {
  attackers: AttackerState[];
  updateAttacker: (index: number, updates: Partial<AttackerState>) => void;
  setAttackers: (attackers: AttackerState[]) => void;
  addAttacker: () => void;
  removeAttacker: (index: number) => void;
  setIsCritical: (index: number, isCritical: boolean) => void;
  updateStat: (index: number, statField: 'attack' | 'specialAttack' | 'defense' | 'specialDefense' | 'speed', updates: Partial<StatCalculation>) => void;
  updateStatValue: (index: number, statField: 'attack' | 'specialAttack' | 'defense' | 'specialDefense' | 'speed', value: string) => void;
  updateStatFromInput: (index: number, statField: 'attack' | 'specialAttack' | 'defense' | 'specialDefense' | 'speed') => void;
  setPokemon: (index: number, pokemon: Pokemon | null) => void;
  setMove: (index: number, move: Move | null) => void;
  recalculateAll: (index: number) => void;
  loadFromSnapshot: (snapshot: AttackerStateSnapshotForLog) => void;
  loadFromTeamMember: (member: TeamMember) => void;
  swapWithDefender: (defenderState: DefenderState) => void;
  changeFormKeepStats: (index: number, newPokemon: Pokemon) => void;
}

export const useAttackerStore = create<AttackerStore>((set, get) => ({
  attackers: [createInitialAttackerState()],

  setAttackers: (attackers) => set({ attackers }),

  updateAttacker: (index, updates) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const currentAttacker = newAttackers[index];
      if (!currentAttacker) return state;

      const newAttacker = { ...currentAttacker, ...updates };

      if (updates.ability !== undefined && updates.ability?.id !== currentAttacker.ability?.id) {
        const newAbilityId = updates.ability?.id;
        newAttacker.abilityUiFlags = {};
        if (newAbilityId === 'protosynthesis') {
          newAttacker.protosynthesisBoostedStat = 'attack'; // デフォルトを設定
          newAttacker.protosynthesisManualTrigger = false;
        } else {
          newAttacker.protosynthesisBoostedStat = null;
          newAttacker.protosynthesisManualTrigger = false;
        }
        if (newAbilityId === 'quark_drive') {
          newAttacker.quarkDriveBoostedStat = 'attack'; // デフォルトを設定
          newAttacker.quarkDriveManualTrigger = false;
        } else {
          newAttacker.quarkDriveBoostedStat = null;
          newAttacker.quarkDriveManualTrigger = false;
        }
      }
      newAttackers[index] = newAttacker;
      return { attackers: newAttackers };
    });
    get().recalculateAll(index); // 状態更新後に再計算
  },

  addAttacker: () => {
    set(state => {
      if (state.attackers.length < 2) {
        return { attackers: [...state.attackers, createInitialAttackerState()] };
      }
      return state;
    });
  },

  removeAttacker: (index) => {
    set(state => ({
      attackers: state.attackers.filter((_, i) => i !== index)
    }));
  },

  changeFormKeepStats: (index, newPokemon) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const current = newAttackers[index];
      if (!current) return state;

      // メガシンカ時：reqItemに対応するメガストーンを強制セット、解除時はnull
      const forcedItem = newPokemon.isMega && newPokemon.reqItem
        ? (items.find(i => i.id === newPokemon.reqItem) || null)
        : null;

      const statFields = ['attack', 'specialAttack', 'defense', 'specialDefense', 'speed'] as const;
      const newStats: Partial<AttackerState> = {};
      for (const field of statFields) {
        const oldStat = current[`${field}Stat` as const];
        const newBase = newPokemon.baseStats[field];
        const newFinal = calculateFinalStatWithRank(newBase, oldStat.statPoints, oldStat.nature, oldStat.rank);
        (newStats as Record<string, unknown>)[`${field}Stat`] = { ...oldStat, base: newBase, final: newFinal };
        (newStats as Record<string, unknown>)[`${field}InputValue`] = newFinal.toString();
      }

      // 特性を新フォームの最初の特性に更新（nameEnで検索）
      const newAbilityNameEn = newPokemon.abilities[0];
      const newAbility = newAbilityNameEn
        ? (abilities.find(a => a.nameEn?.toLowerCase() === newAbilityNameEn.toLowerCase()) ||
           abilities.find(a => a.name === newAbilityNameEn) ||
           current.ability)
        : current.ability;

      newAttackers[index] = {
        ...current,
        pokemon: newPokemon,
        item: forcedItem,
        ability: newAbility,
        ...newStats,
      };
      return { attackers: newAttackers };
    });
    get().recalculateAll(index);
  },

  setIsCritical: (index, isCritical) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const attacker = newAttackers[index];
      if (attacker) {
        newAttackers[index] = { ...attacker, isCritical };
        return { attackers: newAttackers };
      }
      return state;
    });
  },

  updateStat: (index, statField, updates) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const attacker = newAttackers[index];
      if (!attacker || !attacker.pokemon) return state;
      const statKey = `${statField}Stat` as const;
      const newStat = { ...attacker[statKey], ...updates };
      newStat.final = calculateFinalStatWithRank(attacker.pokemon.baseStats[statField], newStat.statPoints, newStat.nature, newStat.rank);
      newAttackers[index] = { ...attacker, [statKey]: newStat, [`${statField}InputValue`]: newStat.final.toString() };
      return { attackers: newAttackers };
    });
    get().recalculateAll(index);
  },

  updateStatValue: (index, statField, value) => {
    set(state => {
      const newAttackers = [...state.attackers];
      if (newAttackers[index]) {
        newAttackers[index] = { ...newAttackers[index], [`${statField}InputValue`]: value };
      }
      return { attackers: newAttackers };
    });
  },

  updateStatFromInput: (index, statField) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const attacker = newAttackers[index];
      if (!attacker || !attacker.pokemon) return state;
      const statKey = `${statField}Stat` as const;
      const inputValueKey = `${statField}InputValue` as const;
      const stat = attacker[statKey];
      const inputValueStr = attacker[inputValueKey];
      const baseStat = attacker.pokemon.baseStats[statField];
      let targetFinalValue = parseInt(inputValueStr, 10);
      let newPoints = stat.statPoints;
      if (!isNaN(targetFinalValue) && targetFinalValue >= 0) {
        const rankMultiplier = stat.rank !== 0 ? (stat.rank > 0 ? (2 + stat.rank) / 2 : 2 / (2 - stat.rank)) : 1;
        const targetBaseStatValue = Math.floor(targetFinalValue / rankMultiplier);
        newPoints = findClosestStatPointForBaseValue(targetBaseStatValue, baseStat, stat.nature);
      }
      const newStat = { ...stat, statPoints: newPoints };
      newStat.final = calculateFinalStatWithRank(baseStat, newPoints, newStat.nature, newStat.rank);
      newAttackers[index] = { ...attacker, [statKey]: newStat, [inputValueKey]: newStat.final.toString() };
      return { attackers: newAttackers };
    });
    get().recalculateAll(index);
  },

  setPokemon: (index, pokemon) => {
    if (!pokemon) {
      get().updateAttacker(index, { pokemon: null, move: null, item: null, ability: null, loadedMoves: null });
      return;
    }

    const initialAbility = abilities.find(a => a.name.toLowerCase() === pokemon.abilities[0].toLowerCase()) || null;
    const createStat = (base: number, statPoints: number = 0): StatCalculation => {
      const final = calculateFinalStatWithRank(base, statPoints, 1.0, 0);
      return { base, statPoints, nature: 1.0, rank: 0, final };
    };
    // ポケモン選択時にこうげき・とくこうのステータスポイントを32に設定
    const attackStat = createStat(pokemon.baseStats.attack, 32);
    const specialAttackStat = createStat(pokemon.baseStats.specialAttack, 32);
    const defenseStat = createStat(pokemon.baseStats.defense, 0);
    const specialDefenseStat = createStat(pokemon.baseStats.specialDefense, 0);
    const speedStat = createStat(pokemon.baseStats.speed, 0);
    const hpStatPoints = 0;
    const actualMaxHp = calculateHp(pokemon.baseStats.hp, hpStatPoints);

    // ★ ポケモンが変更された際に、popularMovesから技リストを取得してloadedMovesに設定
    const popularMoveNames = popularMoves[pokemon.name];
    const popularMovesForPokemon = popularMoveNames
      ? popularMoveNames
        .map(name => allMovesData.find(m => m.name === name))
        .filter((m): m is Move => m !== undefined)
      : null;

    let autoSelectedMove: Move | null = null;
    // 1. 人気技リストの中から最初の攻撃技を選択
    if (popularMovesForPokemon && popularMovesForPokemon.length > 0) {
      autoSelectedMove = popularMovesForPokemon.find(m => m.category !== 'status') || null;
    }

    // 2. それでも技が見つからなければ、従来のフォールバックロジック
    if (!autoSelectedMove) {
      autoSelectedMove = allMovesData.find(m => m.category !== 'status' && pokemon.types.includes(m.type)) || // タイプ一致の攻撃技
        allMovesData.find(m => m.category !== 'status') || // 何かしらの攻撃技
        null;
    }


    get().updateAttacker(index, {
      pokemon,
      ability: initialAbility,
      attackStat, specialAttackStat, defenseStat, specialDefenseStat, speedStat,
      attackInputValue: attackStat.final.toString(),
      specialAttackInputValue: specialAttackStat.final.toString(),
      defenseInputValue: defenseStat.final.toString(),
      specialDefenseInputValue: specialDefenseStat.final.toString(),
      speedInputValue: speedStat.final.toString(),
      hpStatPoints, actualMaxHp, currentHp: actualMaxHp,
      move: autoSelectedMove,
      item: null,
      teraType: null, loadedTeraType: null, isStellar: false,
      isCritical: autoSelectedMove?.alwaysCrit === true,
      hasHelpingHand: false, hasFlowerGift: false,
      moveUiOptionStates: {},
      abilityUiFlags: {},
      loadedMoves: popularMovesForPokemon, // ★人気技リストをセット
      variableHitStates: autoSelectedMove?.variablePowers ? autoSelectedMove.variablePowers.map(() => true) : [],
      selectedHitCount: (typeof autoSelectedMove?.multihit === 'number') ? autoSelectedMove.multihit : (autoSelectedMove?.multihit === '2-5' ? 2 : null),
      // プロトシンセシス/クォークドライブの初期化もここで行う
      protosynthesisBoostedStat: initialAbility?.id === 'protosynthesis' ? 'attack' : null,
      protosynthesisManualTrigger: false,
      quarkDriveBoostedStat: initialAbility?.id === 'quark_drive' ? 'attack' : null,
      quarkDriveManualTrigger: false,
    });
  },

  setMove: (index, move) => {
    const attacker = get().attackers[index];
    if (!attacker) return;
    const newMoveUiOptionStates = { ...attacker.moveUiOptionStates };

    if (move?.isRankBasedPower) {
      if (newMoveUiOptionStates['rankBasedPowerValue'] === undefined) {
        if (move.id === 'lastrespects' || move.id === 'ragefist') {
          newMoveUiOptionStates['rankBasedPowerValue'] = 50;
        } else {
          newMoveUiOptionStates['rankBasedPowerValue'] = 20;
        }
      }
    } else {
      delete newMoveUiOptionStates['rankBasedPowerValue'];
    }

    let newSelectedHitCount: number | null = null;
    let newVariableHitStates: boolean[] = [];

    if (move?.variablePowers && move.variablePowers.length > 0) {
      newVariableHitStates = move.variablePowers.map(() => true);
      newSelectedHitCount = null;
    } else if (move && typeof move.multihit === 'number') {
      newSelectedHitCount = move.multihit;
    } else if (move && move.multihit === '2-5') {
      newSelectedHitCount = 2;
    }

    const newIsCritical = move?.alwaysCrit === true;

    get().updateAttacker(index, {
      move,
      moveUiOptionStates: newMoveUiOptionStates,
      selectedHitCount: newSelectedHitCount,
      variableHitStates: newVariableHitStates,
      isCritical: newIsCritical,
    });
  },

  recalculateAll: (index) => {
    set(state => {
      const newAttackers = [...state.attackers];
      const attacker = newAttackers[index];
      if (!attacker || !attacker.pokemon || !attacker.move) {
        if (attacker && attacker.effectiveMove !== null) { // 技がnullでもeffectiveMoveが残っている場合があるためクリア
          newAttackers[index] = { ...attacker, effectiveMove: null, teraBlastDeterminedCategory: null, teraBlastDeterminedType: null, starstormDeterminedCategory: null, photonGeyserDeterminedCategory: null };
          return { attackers: newAttackers };
        }
        return state; // ポケモンまたは技がなければ何もしない
      };
      let updatedAttacker = { ...attacker };
      const { weather, field } = useGlobalStateStore.getState();
      const { pokemon: defenderPokemon } = useDefenderStore.getState(); // defenderPokemon が null の可能性も考慮
      const moveContext: MoveDynamicContext = { attackerPokemon: attacker.pokemon, defenderPokemon: defenderPokemon, attackerAbility: attacker.ability, weather, field, moveUiOptions: attacker.moveUiOptionStates };

      updatedAttacker.effectiveMove = getEffectiveMoveProperties(attacker.move, moveContext);

      if (updatedAttacker.effectiveMove?.isTeraBlast) {
        let determinedCategory: MoveCategory | null = updatedAttacker.effectiveMove.category as MoveCategory;
        const isTerastallized = attacker.teraType !== null || attacker.isStellar;
        if (isTerastallized) {
          if (attacker.teraBlastUserSelectedCategory === 'physical') determinedCategory = 'physical';
          else if (attacker.teraBlastUserSelectedCategory === 'special') determinedCategory = 'special';
          // 'auto' の場合、または未選択の場合は能力値比較
          else determinedCategory = attacker.attackStat.final >= attacker.specialAttackStat.final ? 'physical' : 'special';
        }
        updatedAttacker.teraBlastDeterminedCategory = determinedCategory;
        // テラバーストのタイプ決定 (ステラの場合も考慮)
        updatedAttacker.teraBlastDeterminedType = attacker.isStellar ? 'stellar' : attacker.teraType || attacker.pokemon.types[0];

      } else {
        updatedAttacker.teraBlastDeterminedCategory = null;
        updatedAttacker.teraBlastDeterminedType = null;
      }

      if (updatedAttacker.effectiveMove?.id === "terastarstorm" && attacker.pokemon?.id === "1024-s") { // テラパゴス(ステラフォルム)
        updatedAttacker.starstormDeterminedCategory = attacker.attackStat.final > attacker.specialAttackStat.final ? 'physical' : 'special';
      } else {
        updatedAttacker.starstormDeterminedCategory = null;
      }
      if (updatedAttacker.effectiveMove?.id === "photongeyser") {
        updatedAttacker.photonGeyserDeterminedCategory = attacker.attackStat.final > attacker.specialAttackStat.final ? 'physical' : 'special';
      } else {
        updatedAttacker.photonGeyserDeterminedCategory = null;
      }
      newAttackers[index] = updatedAttacker;
      return { attackers: newAttackers };
    });
  },

  loadFromSnapshot: (snapshot) => {
    const pokemon = pokedex.find(p => String(p.id) === String(snapshot.pokemonId));
    const move = allMovesData.find(m => m.id === snapshot.moveId) || null;
    const item = items.find(i => i.id === snapshot.itemId) || null;
    const ability = abilities.find(a => a.id === snapshot.abilityId) || null;

    if (!pokemon) {
      console.error("Attacker Pokemon not found from snapshot for ID:", snapshot.pokemonId);
      alert("ログの復元に必要な攻撃側のポケモンデータが見つかりませんでした。");
      return;
    }

    const restoreStat = (snap: StatCalculationSnapshot, base: number): StatCalculation => {
      const newStat = { base, statPoints: snap.statPoints, nature: snap.nature, rank: snap.rank, final: 0 };
      newStat.final = calculateFinalStatWithRank(base, snap.statPoints, snap.nature, snap.rank);
      return newStat;
    };

    const attackStat = restoreStat(snapshot.attackStat, pokemon.baseStats.attack);
    const specialAttackStat = restoreStat(snapshot.specialAttackStat, pokemon.baseStats.specialAttack);
    const defenseStat = restoreStat(snapshot.defenseStat, pokemon.baseStats.defense);
    // スナップショットに特防がない場合を考慮 (古いログデータの互換性のため)
    const specialDefenseStatSnap = (snapshot as any).specialDefenseStat || { statPoints: 0, nature: 1.0, rank: 0 };
    const specialDefenseStat = restoreStat(specialDefenseStatSnap, pokemon.baseStats.specialDefense);
    const speedStat = restoreStat(snapshot.speedStat, pokemon.baseStats.speed);
    const actualMaxHp = calculateHp(pokemon.baseStats.hp, snapshot.hpStatPoints);

    const newAttackerState: AttackerState = {
      pokemon, move, item, ability,
      attackStat, specialAttackStat, defenseStat, specialDefenseStat, speedStat,
      attackInputValue: attackStat.final.toString(),
      specialAttackInputValue: specialAttackStat.final.toString(),
      defenseInputValue: defenseStat.final.toString(),
      specialDefenseInputValue: specialDefenseStat.final.toString(),
      speedInputValue: speedStat.final.toString(),
      hpStatPoints: snapshot.hpStatPoints,
      actualMaxHp,
      currentHp: snapshot.currentHp,
      teraType: snapshot.teraType,
      loadedTeraType: snapshot.loadedTeraType,
      isStellar: snapshot.isStellar,
      isBurned: snapshot.isBurned,
      isCritical: snapshot.isCritical || false,
      hasHelpingHand: snapshot.hasHelpingHand,
      hasFlowerGift: snapshot.hasFlowerGift || false,
      isEnabled: true, // ロード時は常に有効
      teraBlastUserSelectedCategory: snapshot.teraBlastUserSelectedCategory || 'auto',
      starstormDeterminedCategory: snapshot.starstormDeterminedCategory,
      photonGeyserDeterminedCategory: snapshot.photonGeyserDeterminedCategory,
      selectedHitCount: snapshot.selectedHitCount,
      protosynthesisBoostedStat: snapshot.protosynthesisBoostedStat,
      protosynthesisManualTrigger: snapshot.protosynthesisManualTrigger,
      quarkDriveBoostedStat: snapshot.quarkDriveBoostedStat,
      quarkDriveManualTrigger: snapshot.quarkDriveManualTrigger,
      moveUiOptionStates: snapshot.moveUiOptionStates || {},
      abilityUiFlags: snapshot.abilityUiFlags || {},
      variableHitStates: snapshot.variableHitStates || (move?.variablePowers ? move.variablePowers.map(() => true) : []),
      effectiveMove: null, // recalculateAllで再計算
      teraBlastDeterminedType: null, // recalculateAllで再計算
      teraBlastDeterminedCategory: null, // recalculateAllで再計算
      loadedMoves: null, // スナップショットからはチーム構成技は復元しない
    };

    set({ attackers: [newAttackerState] }); // 攻撃側は1体として復元
    get().recalculateAll(0);
  },

  loadFromTeamMember: (member) => {
    const { pokemon, item, ability, teraType, statPoints, nature, moves: loadedTeamMoves } = member;
    const natureDetails = natures.find(n => n.nameEn === nature?.nameEn) || undefined;

    const restoreStat = (base: number, statPoints: number, statField: 'attack' | 'specialAttack' | 'defense' | 'specialDefense' | 'speed'): StatCalculation => {
      const natureMod = getNatureModifierValueFromDetails(natureDetails as any, statField);
      const newStat = { base, statPoints, nature: natureMod, rank: 0, final: 0 };
      newStat.final = calculateFinalStatWithRank(base, statPoints, natureMod, 0);
      return newStat;
    };

    const attackStat = restoreStat(pokemon.baseStats.attack, statPoints.attack, 'attack');
    const specialAttackStat = restoreStat(pokemon.baseStats.specialAttack, statPoints.specialAttack, 'specialAttack');
    const defenseStat = restoreStat(pokemon.baseStats.defense, statPoints.defense, 'defense');
    const specialDefenseStat = restoreStat(pokemon.baseStats.specialDefense, statPoints.specialDefense, 'specialDefense');
    const speedStat = restoreStat(pokemon.baseStats.speed, statPoints.speed, 'speed');
    const actualMaxHp = calculateHp(pokemon.baseStats.hp, statPoints.hp);

    let initialMove: Move | null = null;
    // 1. チームメンバーの技リストから最初の攻撃技を選択
    if (loadedTeamMoves && loadedTeamMoves.length > 0) {
      for (const teamMove of loadedTeamMoves) {
        if (teamMove && teamMove.category !== 'status') {
          initialMove = teamMove;
          break;
        }
      }
    }
    // 2. チームの技に攻撃技がなければ、人気技から選択
    if (!initialMove) {
      const popularMoveNamesForPokemon = popularMoves[pokemon.name];
      if (popularMoveNamesForPokemon && popularMoveNamesForPokemon.length > 0) {
        for (const moveName of popularMoveNamesForPokemon) {
          const foundMove = allMovesData.find(m => m.name === moveName && m.category !== 'status');
          if (foundMove) {
            initialMove = foundMove;
            break;
          }
        }
      }
    }
    // 3. それでもなければフォールバック
    if (!initialMove) {
      initialMove = allMovesData.find(m => m.category !== 'status' && pokemon.types.includes(m.type)) ||
        allMovesData.find(m => m.category !== 'status') ||
        null;
    }

    const newState: Partial<AttackerState> = {
      pokemon, item, ability,
      loadedMoves: loadedTeamMoves || [null, null, null, null],
      move: initialMove,
      teraType: null, loadedTeraType: teraType, isStellar: false,
      hpStatPoints: statPoints.hp, actualMaxHp, currentHp: actualMaxHp,
      attackStat, specialAttackStat, defenseStat, specialDefenseStat, speedStat,
      attackInputValue: attackStat.final.toString(),
      specialAttackInputValue: specialAttackStat.final.toString(),
      defenseInputValue: defenseStat.final.toString(),
      specialDefenseInputValue: specialDefenseStat.final.toString(),
      speedInputValue: speedStat.final.toString(),
      isBurned: false,
      isCritical: initialMove?.alwaysCrit === true,
      hasHelpingHand: false, hasFlowerGift: false, // チームロード時はリセット
      selectedHitCount: (typeof initialMove?.multihit === 'number') ? initialMove.multihit : (initialMove?.multihit === '2-5' ? 2 : null),
      moveUiOptionStates: {},
      abilityUiFlags: {},
      variableHitStates: initialMove?.variablePowers ? initialMove.variablePowers.map(() => true) : [],
      protosynthesisBoostedStat: ability?.id === 'protosynthesis' ? 'attack' : null,
      protosynthesisManualTrigger: false,
      quarkDriveBoostedStat: ability?.id === 'quark_drive' ? 'attack' : null,
      quarkDriveManualTrigger: false,
    };

    set(state => {
      const newAttackers = [...state.attackers];
      // 常に最初の攻撃側を更新する
      newAttackers[0] = { ...createInitialAttackerState(), ...newState, pokemon: newState.pokemon! };
      return { attackers: newAttackers };
    });
    get().recalculateAll(0);
  },

  swapWithDefender: (defenderState) => {
    if (!defenderState.pokemon) return;

    const {
      pokemon, item, ability, teraType, isStellar, isBurned, hpStat,
      attackStat, specialAttackStat, defenseStat, specialDefenseStat, speedStat,
      attackInputValue, specialAttackInputValue, defenseInputValue, specialDefenseInputValue, speedInputValue,
      hasFlowerGift, protosynthesisBoostedStat, protosynthesisManualTrigger,
      quarkDriveBoostedStat, quarkDriveManualTrigger
    } = defenderState;

    const attackerIndex = 0;
    const currentAttacker = get().attackers[attackerIndex] || createInitialAttackerState();
    const actualMaxHp = calculateHp(pokemon.baseStats.hp, hpStat.statPoints);

    // 入れ替え時も、可能なら人気技を自動設定
    let autoSelectedMoveOnSwap: Move | null = null;
    const popularMoveNamesForSwappedPokemon = popularMoves[pokemon.name];
    if (popularMoveNamesForSwappedPokemon && popularMoveNamesForSwappedPokemon.length > 0) {
      for (const moveName of popularMoveNamesForSwappedPokemon) {
        const foundMove = allMovesData.find(m => m.name === moveName && m.category !== 'status');
        if (foundMove) {
          autoSelectedMoveOnSwap = foundMove;
          break;
        }
      }
    }
    if (!autoSelectedMoveOnSwap) {
      autoSelectedMoveOnSwap = allMovesData.find(m => m.category !== 'status' && pokemon.types.includes(m.type)) ||
        allMovesData.find(m => m.category !== 'status') ||
        null;
    }


    const updatedAttacker: AttackerState = {
      ...currentAttacker,
      pokemon, item, ability, teraType, isStellar, isBurned, hasFlowerGift,
      move: autoSelectedMoveOnSwap, // ★ 入れ替え時も技を自動設定
      loadedMoves: null,
      effectiveMove: null,
      hpStatPoints: hpStat.statPoints,
      actualMaxHp,
      currentHp: actualMaxHp,
      attackStat, attackInputValue,
      specialAttackStat, specialAttackInputValue,
      defenseStat, defenseInputValue,
      specialDefenseStat, specialDefenseInputValue,
      speedStat, speedInputValue,
      hasHelpingHand: false,
      isCritical: autoSelectedMoveOnSwap?.alwaysCrit === true,
      protosynthesisBoostedStat, protosynthesisManualTrigger,
      quarkDriveBoostedStat, quarkDriveManualTrigger,
      moveUiOptionStates: {},
      abilityUiFlags: {},
      variableHitStates: autoSelectedMoveOnSwap?.variablePowers ? autoSelectedMoveOnSwap.variablePowers.map(() => true) : [],
      teraBlastDeterminedCategory: null,
      teraBlastDeterminedType: null,
      starstormDeterminedCategory: null,
      photonGeyserDeterminedCategory: null,
      selectedHitCount: (typeof autoSelectedMoveOnSwap?.multihit === 'number') ? autoSelectedMoveOnSwap.multihit : (autoSelectedMoveOnSwap?.multihit === '2-5' ? 2 : null),
    };

    set(state => {
      const newAttackers = [...state.attackers];
      if (newAttackers.length === 0) {
        newAttackers.push(updatedAttacker);
      } else {
        newAttackers[attackerIndex] = updatedAttacker;
      }
      return { attackers: newAttackers };
    });
    get().recalculateAll(attackerIndex);
  },
}));

useGlobalStateStore.subscribe(() => useAttackerStore.getState().attackers.forEach((_, index) => useAttackerStore.getState().recalculateAll(index)));
useDefenderStore.subscribe(() => useAttackerStore.getState().attackers.forEach((_, index) => useAttackerStore.getState().recalculateAll(index)));