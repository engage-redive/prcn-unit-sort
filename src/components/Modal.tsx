import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // Escキーでモーダルを閉じる
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 背景のスクロールを禁止
      document.body.style.overflow = 'hidden';
    }

    // クリーンアップ関数
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      {/* モーダル本体 */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-50 rounded-lg shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // モーダル内のクリックで閉じないようにする
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;