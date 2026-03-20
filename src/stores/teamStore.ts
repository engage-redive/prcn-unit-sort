// src/stores/teamStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Pokemon, Move, Item, Ability, PokemonType, Nature } from '../types';

// 型定義（TeamManager.tsxから移動）
export interface TeamMember {
  id: string;
  pokemon: Pokemon;
  level: number;
  item: Item | null;
  ability: Ability | null;
  teraType: PokemonType | 'none';
  nature: Nature | null;
  statPoints: { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number; };
  moves: (Move | null)[];
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

// ストアの状態の型定義
interface TeamState {
  teams: Team[];
  hydrated: boolean; // データの読み込み完了を追跡するフラグ
}

// ストアのアクションの型定義
interface TeamActions {
  setHydrated: (hydrated: boolean) => void;
  createTeam: () => string; // 作成したチームのIDを返す
  deleteTeam: (teamId: string) => void;
  updateTeamName: (teamId: string, name: string) => void;
  addMemberToTeam: (teamId: string, member: TeamMember) => void;
  updateMemberInTeam: (teamId: string, member: TeamMember) => void;
  deleteMemberFromTeam: (teamId: string, memberId: string) => void;
  setTeams: (teams: Team[]) => void; // インポート機能などで一括設定するため
}

const TEAM_STORAGE_KEY = 'pokemonTeams_v2';

export const useTeamStore = create<TeamState & TeamActions>()(
  persist(
    (set, get) => ({
      teams: [{ id: Date.now().toString(), name: 'チーム1', members: [] }],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),

      createTeam: () => {
        const newTeamId = Date.now().toString();
        const newTeam: Team = { id: newTeamId, name: `チーム ${get().teams.length + 1}`, members: [] };
        set(state => ({ teams: [...state.teams, newTeam] }));
        return newTeamId;
      },

      deleteTeam: (teamId) => {
        set(state => ({ teams: state.teams.filter(t => t.id !== teamId) }));
      },

      updateTeamName: (teamId, name) => {
        set(state => ({
          teams: state.teams.map(t => t.id === teamId ? { ...t, name } : t),
        }));
      },
      
      addMemberToTeam: (teamId, member) => {
        set(state => ({
          teams: state.teams.map(t => {
            if (t.id === teamId && t.members.length < 6) {
              return { ...t, members: [...t.members, member] };
            }
            return t;
          })
        }));
      },

      updateMemberInTeam: (teamId, updatedMember) => {
        set(state => ({
          teams: state.teams.map(t => {
            if (t.id === teamId) {
              return { ...t, members: t.members.map(m => m.id === updatedMember.id ? updatedMember : m) };
            }
            return t;
          })
        }));
      },

      deleteMemberFromTeam: (teamId, memberId) => {
        set(state => ({
          teams: state.teams.map(t => {
            if (t.id === teamId) {
              return { ...t, members: t.members.filter(m => m.id !== memberId) };
            }
            return t;
          })
        }));
      },

      setTeams: (teams) => set({ teams }),
    }),
    {
      name: TEAM_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.setHydrated(true);
        }
      }
    }
  )
);