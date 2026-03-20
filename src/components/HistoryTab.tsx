

import React from 'react';
import { LoggedDamageEntry } from '../types';
import LogCard from './LogCard';
import { useHistoryStore } from '../stores/historyStore';
import { FileText, Trash } from 'lucide-react';


const HistoryTab: React.FC = () => {

  const { loggedEntries, clearAllLogs } = useHistoryStore();

  if (!loggedEntries || loggedEntries.length === 0) {
    return (
      <div className="p-4 md:p-8 w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-10 flex flex-col items-center shadow-2xl relative overflow-hidden w-full max-w-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <FileText size={64} className="text-slate-600 mb-6 drop-shadow-md relative z-10" />
          <p className="text-2xl font-bold text-slate-300 mb-2 font-mono tracking-wide relative z-10">履歴はありません</p>
          <p className="text-sm text-slate-400 text-center relative z-10 leading-relaxed">
            ダメージ計算を行い、「詳細を見る」を開くと<br className="hidden sm:block" />
            ここに計算履歴が自動で保存されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 min-h-[calc(100vh-64px)] relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none -z-10"></div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 bg-slate-900/40 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-slate-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm flex items-center font-mono tracking-wide">
            <FileText className="mr-3 text-emerald-400" size={28} />
            履歴(詳細を押すと自動保存)
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            保存された詳細な計算結果をいつでも確認・復元できます
          </p>
        </div>

        {loggedEntries.length > 0 && (
          <button
            onClick={clearAllLogs}
            className="flex items-center px-4 py-2 sm:py-2.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 hover:text-red-200 rounded-lg text-sm transition-all duration-300 border border-red-800/50 shadow-sm shrink-0 font-medium group"
            aria-label="すべてのログを削除"
            title="すべての履歴を消去します"
          >
            <Trash size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            履歴を全て削除
          </button>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {loggedEntries.map(entry => (
          <LogCard
            key={entry.id}
            logEntry={entry}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;