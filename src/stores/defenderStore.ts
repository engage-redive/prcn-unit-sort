// src/stores/defenderStore.ts

import { create } from 'zustand';
import {
  DefenderState, Pokemon, Item, Ability, StatCalculation, NatureModifier,
  PokemonType, DefenderStateSnapshotForLog, StatCalculationSnapshot, Nature, AttackerState,
} from '../types';
import { TeamMember } from './teamStore';
import { pokedex } from '../data/pokedex';
import { items } from '../data/items';
import { abilities } from '../data/abilities';

import { useGlobalStateStore } from './globalStateStore';

// ユーティリティ関数
const calculateHp = (base: number, statPoints: number): number => {
  if (base <= 0) return 0;
  if (base === 1) return 1;
  return Math.floor(base + 75 + statPoints);
};
const calculateStat = (base: number, statPoints: number, nature: NatureModifier, isHp: boolean, rank: number = 0): number => {
    let finalStat: number;
    if (isHp) {
        if (base === 1) return 1;
        finalStat = Math.floor(base + 75 + statPoints);
    } else {
        let stat = Math.floor(base + 20 + statPoints);
        stat = Math.floor(stat * nature);
        if (rank !== 0) {
            const rankMultiplier = rank > 0 ? (2 + rank) / 2 : 2 / (2 - rank);
            stat = Math.floor(stat * rankMultiplier);
        }
        finalStat = stat;
    }
    return Math.max(1, finalStat);
};
const findClosestStatPoint = (target: number, base: number, nature: NatureModifier, isHp: boolean, rank: number = 0): number => {
    if (base <= 0 || target <= 0) return 0;
    if (isHp && base === 1) return 0;
    const statAt0 = calculateStat(base, 0, nature, isHp, rank);
    if (target <= statAt0) return 0;
    const statAt32 = calculateStat(base, 32, nature, isHp, rank);
    if (target >= statAt32) return 32;
    let closestPoints = 0;
    let smallestDiff = Infinity;
    for (let points = 0; points <= 32; points += 1) {
      const calcStat = calculateStat(base, points, nature, isHp, rank);
      const diff = Math.abs(calcStat - target);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestPoints = points;
      }
    }
    return closestPoints;
};
const getNatureModifierValueFromDetails = (natureDetails: Nature | undefined, statField: 'attack' | 'defense' | 'specialAttack'| 'specialDefense' | 'speed'): NatureModifier => {
    if (!natureDetails) return 1.0;
    if (natureDetails.increasedStat === statField) return 1.1;
    if (natureDetails.decreasedStat === statField) return 0.9;
    return 1.0;
};
// (ここまでユーティリティ関数)


const createInitialDefenderState = (): DefenderState => {
  const initialPokemon = pokedex.find(p => p.name === "カイリュー") || pokedex[0];
  const initialAbility = abilities.find(a => a.name.toLowerCase() === initialPokemon.abilities[0].toLowerCase()) || null;

  const createStat = (base: number, isHp = false): StatCalculation => {
    const final = calculateStat(base, 0, 1.0, isHp);
    return { base, statPoints: 0, nature: 1.0, rank: 0, final };
  };

  const hpStat = createStat(initialPokemon.baseStats.hp, true);
  const defenseStat = createStat(initialPokemon.baseStats.defense);
  const specialDefenseStat = createStat(initialPokemon.baseStats.specialDefense);
  const attackStat = createStat(initialPokemon.baseStats.attack);
  const specialAttackStat = createStat(initialPokemon.baseStats.specialAttack);
  const speedStat = createStat(initialPokemon.baseStats.speed);

  return {
    pokemon: initialPokemon,
    item: null, ability: initialAbility,
    hpStat, defenseStat, specialDefenseStat, attackStat, specialAttackStat, speedStat,
    hpInputValue: hpStat.final.toString(),
    defenseInputValue: defenseStat.final.toString(),
    specialDefenseInputValue: specialDefenseStat.final.toString(),
    attackInputValue: attackStat.final.toString(),
    specialAttackInputValue: specialAttackStat.final.toString(),
    speedInputValue: speedStat.final.toString(),
    hpStatPoints: 0, actualMaxHp: hpStat.final,
    teraType: null, isStellar: false, isBurned: false, hasFlowerGift: false, isEnabled: true,
    protosynthesisBoostedStat: initialAbility?.id === 'protosynthesis' ? 'defense' : null,
    protosynthesisManualTrigger: false,
    quarkDriveBoostedStat: initialAbility?.id === 'quark_drive' ? 'defense' : null,
    quarkDriveManualTrigger: false,
  };
};

interface DefenderStore extends DefenderState {
  defender2Item: Item | null;
  defender2Ability: Ability | null;
  userModifiedTypes: [PokemonType, PokemonType?] | null;
  setDefenderState: (updates: Partial<DefenderState>) => void;
  setPokemon: (pokemon: Pokemon | null) => void;
  // ▼▼▼ statFieldの型に 'specialAttack' を追加 ▼▼▼
  updateStat: (statField: 'hp' | 'defense' | 'specialDefense' | 'attack' | 'specialAttack' | 'speed', updates: Partial<StatCalculation>) => void;
  updateStatValue: (statField: 'hp' | 'defense' | 'specialDefense' | 'attack' | 'specialAttack' | 'speed', value: string) => void;
  updateStatFromInput: (statField: 'hp' | 'defense' | 'specialDefense' | 'attack' | 'specialAttack' | 'speed') => void;
  // ▲▲▲ ここまで修正 ▲▲▲
  setDefender2Item: (item: Item | null) => void;
  setDefender2Ability: (ability: Ability | null) => void;
  setUserModifiedTypes: (types: [PokemonType, PokemonType?] | null) => void;
  loadFromSnapshot: (snapshot: DefenderStateSnapshotForLog) => void;
  loadFromTeamMember: (member: TeamMember) => void;
  swapWithAttacker: (attackerState: AttackerState) => void;
  changeFormKeepStats: (newPokemon: Pokemon) => void;
}

export const useDefenderStore = create<DefenderStore>((set, get) => ({
  ...createInitialDefenderState(),
  defender2Item: null,
  defender2Ability: null,
  userModifiedTypes: null,

  setDefenderState: (updates) => set(state => {
    const currentState = { ...state };
    const newState = { ...currentState, ...updates };

    if (updates.ability !== undefined && updates.ability?.id !== currentState.ability?.id) {
        const newAbilityId = updates.ability?.id;
        
        if (newAbilityId === 'protosynthesis') {
            newState.protosynthesisBoostedStat = 'defense';
            newState.protosynthesisManualTrigger = false;
        } else {
            newState.protosynthesisBoostedStat = null;
            newState.protosynthesisManualTrigger = false;
        }

        if (newAbilityId === 'quark_drive') {
            newState.quarkDriveBoostedStat = 'defense';
            newState.quarkDriveManualTrigger = false;
        } else {
            newState.quarkDriveBoostedStat = null;
            newState.quarkDriveManualTrigger = false;
        }
    }
    return newState;
  }),

  setPokemon: (pokemon) => {
    if (!pokemon) {
      set({ pokemon: null, item: null, ability: null, userModifiedTypes: null });
      return;
    }
    const initialAbility = abilities.find(a => a.name.toLowerCase() === pokemon.abilities[0].toLowerCase()) || null;
    const createStat = (base: number, isHp = false): StatCalculation => {
        const final = calculateStat(base, 0, 1.0, isHp);
        return { base, statPoints: 0, nature: 1.0, rank: 0, final };
    };
    const hpStat = createStat(pokemon.baseStats.hp, true);
    const defenseStat = createStat(pokemon.baseStats.defense);
    const specialDefenseStat = createStat(pokemon.baseStats.specialDefense);
    const attackStat = createStat(pokemon.baseStats.attack);
    const specialAttackStat = createStat(pokemon.baseStats.specialAttack);
    const speedStat = createStat(pokemon.baseStats.speed);
    
    set({
      pokemon, ability: initialAbility, item: null, teraType: null,
      hpStat, defenseStat, specialDefenseStat, attackStat, specialAttackStat, speedStat,
      hpInputValue: hpStat.final.toString(),
      defenseInputValue: defenseStat.final.toString(),
      specialDefenseInputValue: specialDefenseStat.final.toString(),
      specialAttackInputValue: specialAttackStat.final.toString(),
      speedInputValue: speedStat.final.toString(),
      hpStatPoints: 0, actualMaxHp: hpStat.final, userModifiedTypes: null,
      protosynthesisBoostedStat: initialAbility?.id === 'protosynthesis' ? 'defense' : null,
      protosynthesisManualTrigger: false,
      quarkDriveBoostedStat: initialAbility?.id === 'quark_drive' ? 'defense' : null,
      quarkDriveManualTrigger: false,
    });
    useGlobalStateStore.getState().setDefenderIsTerastallized(false);
  },

  changeFormKeepStats: (newPokemon) => {
    set(state => {
      // メガシンカ時：reqItemに対応するメガストーンを強制セット、解除時はnull
      const forcedItem = newPokemon.isMega && newPokemon.reqItem
        ? (items.find(i => i.id === newPokemon.reqItem) || null)
        : null;

      const statFields = ['defense', 'specialDefense', 'attack', 'specialAttack', 'speed'] as const;
      const newStats: Partial<DefenderStore> = {};
      for (const field of statFields) {
        const statKey = `${field}Stat` as const;
        const oldStat = state[statKey];
        const newBase = newPokemon.baseStats[field];
        const newFinal = calculateStat(newBase, oldStat.statPoints, oldStat.nature, false, oldStat.rank);
        newStats[statKey] = { ...oldStat, base: newBase, final: newFinal };
        (newStats as Record<string, unknown>)[`${field}InputValue`] = newFinal.toString();
      }
      // HPは基本ステータスを更新し実数値も再計算
      const oldHpStat = state.hpStat;
      const newHpBase = newPokemon.baseStats.hp;
      const newHpFinal = calculateStat(newHpBase, oldHpStat.statPoints, 1.0, true, 0);
      newStats.hpStat = { ...oldHpStat, base: newHpBase, final: newHpFinal };
      newStats.hpInputValue = newHpFinal.toString();
      newStats.actualMaxHp = newHpFinal;

      // 特性を新フォームの最初の特性に更新（nameEnで検索）
      const newAbilityNameEn = newPokemon.abilities[0];
      const newAbility = newAbilityNameEn
        ? (abilities.find(a => a.nameEn?.toLowerCase() === newAbilityNameEn.toLowerCase()) ||
           abilities.find(a => a.name === newAbilityNameEn) ||
           state.ability)
        : state.ability;

      return {
        ...state,
        pokemon: newPokemon,
        item: forcedItem,
        ability: newAbility,
        ...newStats,
      };
    });
  },
  
  updateStat: (statField, updates) => {
    set(state => {
      if (!state.pokemon) return state;
      const statKey = `${statField}Stat` as const;
      const newStat = { ...state[statKey], ...updates };
      newStat.final = calculateStat(newStat.base, newStat.statPoints, newStat.nature, statField === 'hp', newStat.rank);
      const updatePayload: Partial<DefenderStore> = { [statKey]: newStat, [`${statField}InputValue`]: newStat.final.toString() };
      if (statField === 'hp') {
        updatePayload.hpStatPoints = newStat.statPoints;
        updatePayload.actualMaxHp = newStat.final;
      }
      return updatePayload;
    });
  },

  updateStatValue: (statField, value) => set({ [`${statField}InputValue`]: value }),

  updateStatFromInput: (statField) => {
    set(state => {
        if (!state.pokemon) return state;
        const statKey = `${statField}Stat` as const;
        const inputValue = parseInt(state[`${statField}InputValue`], 10);
        if (isNaN(inputValue)) return { [`${statField}InputValue`]: state[statKey].final.toString() };
        
        let targetBaseValue = inputValue;
        let newPoints = state[statKey].statPoints;
        if (statField !== 'hp') {
            const rankMultiplier = state[statKey].rank !== 0 ? (state[statKey].rank > 0 ? (2 + state[statKey].rank) / 2 : 2 / (2 - state[statKey].rank)) : 1;
            targetBaseValue = Math.round(inputValue / rankMultiplier);
            newPoints = findClosestStatPoint(targetBaseValue, state[statKey].base, state[statKey].nature, false);
        } else {
            newPoints = findClosestStatPoint(inputValue, state[statKey].base, 1.0, true);
        }
        
        const newStat = { ...state[statKey], statPoints: newPoints };
        newStat.final = calculateStat(newStat.base, newPoints, newStat.nature, statField === 'hp', newStat.rank);
        
        const updatePayload: Partial<DefenderStore> = { [statKey]: newStat, [`${statField}InputValue`]: newStat.final.toString() };
        if (statField === 'hp') {
            updatePayload.hpStatPoints = newPoints;
            updatePayload.actualMaxHp = newStat.final;
        }
        return updatePayload;
    });
  },

  setDefender2Item: (item) => set({ defender2Item: item }),
  setDefender2Ability: (ability) => set({ defender2Ability: ability }),
  setUserModifiedTypes: (types) => set({ userModifiedTypes: types }),
  
  loadFromSnapshot: (snapshot) => {
    const pokemon = pokedex.find(p => p.id === snapshot.pokemonId);
    const item = items.find(i => i.id === snapshot.itemId) || null;
    const ability = abilities.find(a => a.id === snapshot.abilityId) || null;
    if (!pokemon) {
        alert("ログの復元に必要な防御側のデータが見つかりませんでした。");
        return;
    }

    const restoreStat = (snap: StatCalculationSnapshot, base: number, isHp = false): StatCalculation => {
        const newStat: StatCalculation = { base, ...snap, final: 0 };
        newStat.final = calculateStat(base, snap.statPoints, snap.nature, isHp, snap.rank);
        return newStat;
    };

    const hpStat = restoreStat(snapshot.hpStat, pokemon.baseStats.hp, true);
    const defenseStat = restoreStat(snapshot.defenseStat, pokemon.baseStats.defense);
    const specialDefenseStat = restoreStat(snapshot.specialDefenseStat, pokemon.baseStats.specialDefense);
    const attackStat = restoreStat(snapshot.attackStat, pokemon.baseStats.attack);
    const speedStat = restoreStat(snapshot.speedStat, pokemon.baseStats.speed);

    // loadFromSnapshotは特攻情報を持たないため、デフォルトで初期化
    const specialAttackStat = createInitialDefenderState().specialAttackStat;


    set({
        pokemon, item, ability,
        hpStat, defenseStat, specialDefenseStat, attackStat, specialAttackStat, speedStat,
        hpInputValue: hpStat.final.toString(),
        defenseInputValue: defenseStat.final.toString(),
        specialDefenseInputValue: specialDefenseStat.final.toString(),
        specialAttackInputValue: specialAttackStat.final.toString(),
        speedInputValue: speedStat.final.toString(),
        hpStatPoints: snapshot.hpStatPoints,
        actualMaxHp: hpStat.final,
        teraType: snapshot.teraType,
        isStellar: snapshot.isStellar,
        isBurned: snapshot.isBurned,
        hasFlowerGift: snapshot.hasFlowerGift,
        protosynthesisBoostedStat: snapshot.protosynthesisBoostedStat,
        protosynthesisManualTrigger: snapshot.protosynthesisManualTrigger,
        quarkDriveBoostedStat: snapshot.quarkDriveBoostedStat,
        quarkDriveManualTrigger: snapshot.quarkDriveManualTrigger,
        userModifiedTypes: snapshot.userModifiedTypes
    });
  },

  loadFromTeamMember: (member) => {
    const { pokemon, item, ability, teraType, statPoints, nature } = member;
    const natureDetails = nature || undefined;

    const restoreStat = (base: number, points: number, statField: 'attack' | 'defense' | 'specialAttack'| 'specialDefense' | 'speed' | 'hp', isHp = false): StatCalculation => {
      const natureMod = isHp ? 1.0 : getNatureModifierValueFromDetails(natureDetails as any, statField as any);
      const newStat = { base, statPoints: points, nature: natureMod, rank: 0, final: 0 };
      newStat.final = calculateStat(base, points, natureMod, isHp, 0);
      return newStat;
    };

    const hpStat = restoreStat(pokemon.baseStats.hp, statPoints.hp, 'hp', true);
    const attackStat = restoreStat(pokemon.baseStats.attack, statPoints.attack, 'attack');
    const defenseStat = restoreStat(pokemon.baseStats.defense, statPoints.defense, 'defense');
    const specialAttackStat = restoreStat(pokemon.baseStats.specialAttack, statPoints.specialAttack, 'specialAttack');
    const specialDefenseStat = restoreStat(pokemon.baseStats.specialDefense, statPoints.specialDefense, 'specialDefense');
    const speedStat = restoreStat(pokemon.baseStats.speed, statPoints.speed, 'speed');

    const newState: Partial<DefenderState> = {
        pokemon, item, ability, teraType,
        hpStat, attackStat, defenseStat, specialAttackStat, specialDefenseStat, speedStat,
        hpInputValue: hpStat.final.toString(),
        // attackInputValue: attackStat.final.toString(),
        defenseInputValue: defenseStat.final.toString(),
        specialAttackInputValue: specialAttackStat.final.toString(),
        specialDefenseInputValue: specialDefenseStat.final.toString(),
        speedInputValue: speedStat.final.toString(),
        hpStatPoints: statPoints.hp,
        actualMaxHp: hpStat.final,
    };
    
    set(newState);
    get().setUserModifiedTypes(null);
    useGlobalStateStore.getState().setHasReflect(false);
    useGlobalStateStore.getState().setHasLightScreen(false);
  },

  swapWithAttacker: (attackerState) => {
    if (!attackerState.pokemon) return;

    // Create default stat objects to prevent undefined errors
    const defaultStat: StatCalculation = { base: 0, statPoints: 0, nature: 1.0, rank: 0, final: 0 };

    const { 
      pokemon, item, ability, teraType, isStellar, isBurned, hpStatPoints,
      attackStat = defaultStat,
      specialAttackStat = defaultStat,
      defenseStat = defaultStat,
      specialDefenseStat = defaultStat,
      speedStat = defaultStat,
      hasFlowerGift, protosynthesisBoostedStat, protosynthesisManualTrigger,
      quarkDriveBoostedStat, quarkDriveManualTrigger
    } = attackerState;
    
    const hp = calculateHp(pokemon.baseStats.hp, hpStatPoints);

    set({
        pokemon, item, ability, teraType, isStellar, isBurned,
        userModifiedTypes: null,
        hasFlowerGift,
        hpStat: { ...get().hpStat, base: pokemon.baseStats.hp, statPoints: hpStatPoints, final: hp },
        hpInputValue: hp.toString(),
        hpStatPoints: hpStatPoints,
        actualMaxHp: hp,
        
        attackStat,
        attackInputValue: attackStat.final.toString(),
        defenseStat,
        defenseInputValue: defenseStat.final.toString(),
        specialAttackStat,
        specialAttackInputValue: specialAttackStat.final.toString(),
        specialDefenseStat,
        specialDefenseInputValue: specialDefenseStat.final.toString(),
        speedStat,
        speedInputValue: speedStat.final.toString(),
        protosynthesisBoostedStat,
        protosynthesisManualTrigger,
        quarkDriveBoostedStat,
        quarkDriveManualTrigger,
    });
  },
}));