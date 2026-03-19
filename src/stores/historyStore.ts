// src/stores/historyStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoggedDamageEntry } from '../types';
import { useAttackerStore } from './attackerStore';
import { useDefenderStore } from './defenderStore';
import { useGlobalStateStore } from './globalStateStore';

const LOG_STORAGE_KEY = 'pokemonDamageCalcLogs_v2';
const MAX_LOG_ENTRIES = 50;

// ストアの状態の型定義
interface HistoryState {
  loggedEntries: LoggedDamageEntry[];
}

// ストアのアクション（状態更新関数）の型定義
interface HistoryActions {
  addLog: (logEntry: Omit<LoggedDamageEntry, 'id' | 'timestamp'>) => void;
  deleteLog: (logId: string) => void;
  clearAllLogs: () => void;
  loadLogToCalculators: (logId: string) => boolean; // 成功したか否かを返す
}

// persistミドルウェアを使ってlocalStorageとの同期を自動化
export const useHistoryStore = create<HistoryState & HistoryActions>()(
  persist(
    (set, get) => ({
      loggedEntries: [],

      // 新しいログを追加するアクション
      addLog: (logData) => {
        const newLogEntry: LoggedDamageEntry = {
          ...logData,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => {
          const updatedEntries = [newLogEntry, ...state.loggedEntries];
          // 最大数を超えたら古いものから削除
          const slicedEntries = updatedEntries.length > MAX_LOG_ENTRIES
            ? updatedEntries.slice(0, MAX_LOG_ENTRIES)
            : updatedEntries;
          return { loggedEntries: slicedEntries };
        });
      },

      // 指定したIDのログを削除するアクション
      deleteLog: (logId) => {
        set((state) => ({
          loggedEntries: state.loggedEntries.filter((entry) => entry.id !== logId),
        }));
      },

      // 全てのログを削除するアクション
      clearAllLogs: () => {
        if (window.confirm(`${get().loggedEntries.length}件のログをすべて削除しますか？この操作は元に戻せません。`)) {
            set({ loggedEntries: [] });
        }
      },
      
      // ログを各ストアの状態に復元するアクション
      loadLogToCalculators: (logId) => {
        const logEntry = get().loggedEntries.find((entry) => entry.id === logId);

        if (!logEntry || !logEntry.attackerStateSnapshot || !logEntry.defenderStateSnapshot || !logEntry.globalStatesSnapshot) {
          alert("このログは古い形式か、データが破損しているため計算を復元できません。");
          return false;
        }

        try {
          const { attackerStateSnapshot, defenderStateSnapshot, globalStatesSnapshot } = logEntry;

          // --- Attackerストアの復元 ---
          useAttackerStore.getState().loadFromSnapshot(attackerStateSnapshot);

          // --- Defenderストアの復元 ---
          useDefenderStore.getState().loadFromSnapshot(defenderStateSnapshot);
          
          // --- Globalストアの復元 ---
          useGlobalStateStore.getState().loadFromSnapshot(globalStatesSnapshot);

          return true; // 成功
        } catch (error) {
          console.error('ログの復元中にエラーが発生しました:', error);
          alert("ログの復元中にエラーが発生しました。");
          return false;
        }
      },
    }),
    {
      name: LOG_STORAGE_KEY, // localStorageのキー名
      storage: createJSONStorage(() => localStorage), // ストレージとしてlocalStorageを指定
    }
  )
);