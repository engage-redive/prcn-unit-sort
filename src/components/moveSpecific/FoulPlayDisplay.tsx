import React from 'react';

const FoulPlayDisplay: React.FC = () => {
  return (
    <div className="p-3 bg-gray-700 rounded-md text-sm text-gray-300">
      <p>
        「イカサマ」は、<span className="font-semibold text-yellow-400">相手の こうげき と こうげきランク</span> を使ってダメージ計算を行います。
      </p>
    </div>
  );
};

export default FoulPlayDisplay;