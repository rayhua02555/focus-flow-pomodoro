import React from 'react';
import { CloudRain, Waves, Flame, Radio, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface AmbientSoundPanelProps {
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
  onSelectAmbientSound: (sound: AppSettings['ambientSound']) => void;
}

export const AmbientSoundPanel: React.FC<AmbientSoundPanelProps> = ({
  settings,
  onUpdateSettings,
  ambientPlaying,
  onToggleAmbient,
  onSelectAmbientSound,
}) => {
  const soundOptions: Array<{
    id: AppSettings['ambientSound'];
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'rain',
      name: '細雨連綿',
      description: '溫和窗邊雨聲',
      icon: CloudRain,
    },
    {
      id: 'waves',
      name: '寧靜海浪',
      description: '規律潮起潮落',
      icon: Waves,
    },
    {
      id: 'campfire',
      name: '溫暖營火',
      description: '劈啪木柴微光',
      icon: Flame,
    },
    {
      id: 'brown',
      name: '深層棕噪音',
      description: '極致屏蔽外界干擾',
      icon: Radio,
    },
    {
      id: 'pink',
      name: '粉紅噪音',
      description: '舒緩均衡持續音',
      icon: Sparkles,
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-neutral-900/90 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Volume2 className="h-4 w-4 text-rose-500" />
            <span>沉浸專注音景 (Web Audio 原生合成)</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            純前端音效引擎實時合成，零流量、無延遲、阻絕外界噪音
          </p>
        </div>
        <button
          onClick={onToggleAmbient}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            ambientPlaying
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
              : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          {ambientPlaying ? (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>播放中</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span>開啟音景</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Sound Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {soundOptions.map((item) => {
          const Icon = item.icon;
          const isSelected = settings.ambientSound === item.id;
          const isActiveAndPlaying = isSelected && ambientPlaying;

          return (
            <button
              key={item.id}
              onClick={() => onSelectAmbientSound(item.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/60 dark:border-rose-500/60 dark:bg-rose-950/20 shadow-xs'
                  : 'border-neutral-200/80 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850/50 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <Icon
                  className={`h-4 w-4 ${
                    isSelected ? 'text-rose-500 dark:text-rose-400' : 'text-neutral-500'
                  }`}
                />
                {isActiveAndPlaying && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {item.name}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Volume slider & mute control */}
      {ambientPlaying && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-neutral-500 shrink-0" />
          <input
            type="range"
            min="5"
            max="100"
            value={settings.ambientVolume}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateSettings((prev) => ({ ...prev, ambientVolume: val }));
            }}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
          />
          <span className="text-xs font-mono text-neutral-500 w-10 text-right">
            {settings.ambientVolume}%
          </span>
        </div>
      )}
    </div>
  );
};
