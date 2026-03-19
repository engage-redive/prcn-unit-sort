// src/stores/globalStateStore.ts
import { create } from 'zustand';
import { Weather, Field, DisasterState, GlobalStatesSnapshotForLog } from '../types';

interface GlobalState {
  isDoubleBattle: boolean;
  weather: Weather;
  field: Field;
  disasters: DisasterState;
  hasReflect: boolean;
  hasLightScreen: boolean;
  hasFriendGuard: boolean;
  defenderIsTerastallized: boolean;
}

interface GlobalActions {
  setIsDoubleBattle: (isDouble: boolean) => void;
  setWeather: (weather: Weather) => void;
  setField: (field: Field) => void;
  setDisasters: (disasters: DisasterState) => void;
  setDisaster: (key: keyof DisasterState, value: boolean) => void;
  setHasReflect: (has: boolean) => void;
  setHasLightScreen: (has: boolean) => void;
  setHasFriendGuard: (has: boolean) => void;
  setDefenderIsTerastallized: (isTerastallized: boolean) => void;
  resetGlobalStates: () => void;
  loadFromSnapshot: (snapshot: GlobalStatesSnapshotForLog) => void;
}

const initialState: GlobalState = {
  isDoubleBattle: false,
  weather: 'none',
  field: 'none',
  disasters: { sword: false, ball: false, vessel: false, talisman: false },
  hasReflect: false,
  hasLightScreen: false,
  hasFriendGuard: false,
  defenderIsTerastallized: false,
};

export const useGlobalStateStore = create<GlobalState & GlobalActions>((set) => ({
  ...initialState,
  setIsDoubleBattle: (isDouble) => set({ isDoubleBattle: isDouble }),
  setWeather: (weather) => set({ weather: weather }),
  setField: (field) => set({ field: field }),
  setDisasters: (disasters) => set({ disasters: disasters }),
  setDisaster: (key, value) => set((state) => ({ disasters: { ...state.disasters, [key]: value } })),
  setHasReflect: (has) => set({ hasReflect: has }),
  setHasLightScreen: (has) => set({ hasLightScreen: has }),
  setHasFriendGuard: (has) => set({ hasFriendGuard: has }),
  setDefenderIsTerastallized: (isTerastallized) => set({ defenderIsTerastallized: isTerastallized }),
  resetGlobalStates: () => set(initialState),
  loadFromSnapshot: (snapshot) => {
    set({
        isDoubleBattle: snapshot.isDoubleBattle,
        weather: snapshot.weather,
        field: snapshot.field,
        disasters: snapshot.disasters,
        hasReflect: snapshot.hasReflect,
        hasLightScreen: snapshot.hasLightScreen,
        hasFriendGuard: snapshot.hasFriendGuard,
        defenderIsTerastallized: snapshot.defenderIsTerastallized,
    });
  },
}));