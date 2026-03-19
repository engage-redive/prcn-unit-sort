

import React from 'react';
import { LoggedDamageEntry } from '../types';
import LogCard from './LogCard';
import { useHistoryStore } from '../stores/historyStore'; 
import { FileText, Trash } from 'lucide-react';


const HistoryTab: React.FC = () => {

  const { loggedEntries, clearAllLogs } = useHistoryStore();

  if (!loggedEntries || loggedEntries.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-xl">履歴はありません。</p>
        <p className="text-sm mt-2">「詳細」ボタンを押すと、履歴が自動保存されます。</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-2xl font-semibold text-white">履歴(詳細を押すと自動保存)</h5>
        {loggedEntries.length > 0 && (
            <button
                // ▼ ストアのアクションを直接呼び出す
                onClick={clearAllLogs}
                className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                aria-label="すべてのログを削除"
            >
                <Trash size={16} className="mr-1.5" />
                全て削除
            </button>
        )}
      </div>
      <div className="space-y-4">
        {loggedEntries.map(entry => (
          <LogCard
            key={entry.id}
            logEntry={entry}
            // ▼ onDeleteとonLoadのpropsは削除
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;