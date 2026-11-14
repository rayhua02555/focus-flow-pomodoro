import React from 'react';
import { Volume2, VolumeX, Maximize2, Settings, Sun, Moon, Palette } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  activeView: 'timer' | 'tasks' | 'stats' | 'guide';
  setActiveView: (view: 'timer' | 'tasks' | 'stats' | 'guide') => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onOpenSettings: () => void;
  onOpenBackgroundModal: () => void;
  onEnterZen: () => void;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
  activeTaskTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenBackgroundModal,
  onEnterZen,
  ambientPlaying,
  onToggleAmbient,
}) => {
  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings((prev) => ({ ...prev, theme: next }));
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 shadow-sm shadow-rose-500/20 text-white shrink-0">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              aria-hidden="true"
            >
              {/* Stylized Tomato Icon */}
              <path d="M12 2c.4 0 .7.2.9.5l.8 1.5c1.4-.4 2.8-.2 3.9.5.4.3.5.8.3 1.2-.2.4-.7.6-1.1.4-.9-.5-2-.6-3-.2l.7 1.2c.2.4.1.9-.3 1.1-.4.2-.9.1-1.1-.3l-.8-1.5-.8 1.5c-.2.4-.7.5-1.1.3-.4-.2-.5-.7-.3-1.1l.7-1.2c-1-.4-2.1-.3-3 .2-.4.2-.9 0-1.1-.4-.2-.4-.1-.9.3-1.2 1.1-.7 2.5-.9 3.9-.5l.8-1.5c.2-.3.5-.5.9-.5zM12 6c4.4 0 8 3.6 8 8 0 4.1-3.1 7.5-7.1 7.9-.6.1-1.2.1-1.8 0C7.1 21.5 4 18.1 4 14c0-4.4 3.6-8 8-8z" />
            </svg>
          </div>
          <button
            onClick={() => setActiveView('timer')}
            className="text-left group cursor-pointer"
          >
            <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-rose-500 transition-colors">
              Pomodoro<span className="hidden sm:inline"> Focus</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop only; mobile uses bottom navigation bar) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveView('timer')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'timer'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            計時器
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'tasks'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            任務規劃
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'stats'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            專注統計
          </button>
          <button
            onClick={() => setActiveView('guide')}
            className={`hidden md:inline-flex px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'guide'
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            番茄心法
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Ambient Sound Trigger */}
          <button
            onClick={onToggleAmbient}
            title={ambientPlaying ? `白噪音播放中: ${settings.ambientSound}` : '開啟專注白噪音'}
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition-all ${
              ambientPlaying
                ? 'border-rose-400/50 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-400'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100'
            }`}
            aria-label="專注白噪音"
          >
            {ambientPlaying ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </>
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={onEnterZen}
            title="進入全螢幕沉浸模式 (Zen)"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="全螢幕專注"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Background Customization Button */}
          <button
            onClick={onOpenBackgroundModal}
            title={
              settings.background?.type !== 'default'
                ? `目前背景: ${settings.background.presetId}`
                : '自訂背景與視覺風格'
            }
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition-all ${
              settings.background?.type !== 'default'
                ? 'border-indigo-400/50 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100'
            }`}
            aria-label="背景自訂"
          >
            <Palette className="h-4 w-4" />
            {settings.background?.type !== 'default' && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-neutral-900" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? '切換為明亮模式' : '切換為暗黑模式'}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="切換主題"
          >
            {settings.theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="計時器與音效設定"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="設定"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
