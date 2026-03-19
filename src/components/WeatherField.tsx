import React from 'react';
import { Weather, Field, DisasterState } from '../types';
import { useGlobalStateStore } from '../stores/globalStateStore';


const WeatherField: React.FC = () => {
  const {
    weather,
    field,
    disasters,
    setWeather,
    setField,
    setDisaster,
  } = useGlobalStateStore();

  const weathers: { value: Weather; label: string;}[] = [
    { value: 'none', label: 'なし', },
    { value: 'sun', label: 'はれ',  },
    { value: 'rain', label: 'あめ', },
    { value: 'sandstorm', label: 'すな', },
    { value: 'snow', label: 'ゆき', }
  ];

  const fields: { value: Field; label: string; }[] = [
    { value: 'none', label: 'なし' },
    { value: 'electric', label: 'エレキ' },
    { value: 'grassy', label: 'グラス' },
    { value: 'psychic', label: 'サイコ' },
    { value: 'misty', label: 'ミスト' }
  ];

  const disasterButtons: { key: keyof DisasterState; label: string; icon: string }[] = [
    { key: 'sword', label: '剣：防御▼', icon: '/icon/1002.png' },
    { key: 'ball', label: '玉：特防▼', icon: '/icon/1004.png' },
    { key: 'talisman', label: '札：攻撃▼', icon: '/icon/1001.png' },
    { key: 'vessel', label: '器：特攻▼', icon: '/icon/1003.png' },
  ];

  const handleDisasterToggle = (key: keyof DisasterState) => {
    setDisaster(key, !disasters[key]);
  };

  return (
    <div className="bg-gray-900 p-1 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-white font-medium mb-3">天候</h3>
          <div className="flex flex-wrap gap-2">
            {weathers.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setWeather(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  weather === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">フィールド</h3>
          <div className="flex flex-wrap gap-2">
            {fields.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setField(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  field === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-white font-medium mb-3">災い</h3>
        <div className="flex flex-wrap gap-2">
          {disasterButtons.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleDisasterToggle(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                disasters[key]
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <img src={icon} alt={label} className="w-4 h-4"  />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherField;