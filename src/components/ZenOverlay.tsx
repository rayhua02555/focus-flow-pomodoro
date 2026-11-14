import React, { useEffect } from 'react';
import { Minimize2, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Plus, Minus } from 'lucide-react';
import { AppSettings, Mode, Task, TimerState } from '../types';
import { getBackgroundStyles } from '../utils/backgroundPresets';

interface ZenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  timeLeft: number;
  timerState: TimerState;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onNudgeTime?: (deltaSeconds: number) => void;
  activeTask?: Task;
  settings: AppSettings;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({
  isOpen,
  onClose,
  mode,
  timeLeft,
  timerState,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onNudgeTime,
  activeTask,
  settings,
  ambientPlaying,
  onToggleAmbient,
}) => {
  // Listen for Escape key to exit Zen mode
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onToggleTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggleTimer]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const modeColor =
    mode === 'focus'
      ? 'text-rose-500'
      : mode === 'shortBreak'
      ? 'text-emerald-500'
      : 'text-indigo-400';

  const modeBgGlow =
    mode === 'focus'
      ? 'bg-rose-500/10'
      : mode === 'shortBreak'
      ? 'bg-emerald-500/10'
      : 'bg-indigo-500/10';

  const bgStyles = settings.background?.applyToZen
    ? getBackgroundStyles(settings.background)
    : { wrapperStyle: {}, overlayStyle: { display: 'none' }, hasCustomBackground: false };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-neutral-950 p-5 sm:p-12 text-neutral-100 animate-in fade-in duration-300 overflow-hidden pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
      {/* Custom Background Layer */}
      {bgStyles.hasCustomBackground && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-all duration-500"
          style={bgStyles.wrapperStyle}
        />
      )}

      {/* Dimming / Contrast Overlay */}
      {bgStyles.hasCustomBackground && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={bgStyles.overlayStyle}
        />
      )}

      {/* Background ambient subtle breathing pulse */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-1000 ${
          timerState === 'running' ? 'opacity-100 animate-pulse' : 'opacity-40'
        } ${modeBgGlow}`}
      />

      {/* Top Bar: Title & Exit Zen Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-xs font-medium tracking-widest uppercase text-neutral-400">
            ZEN FOCUS MODE
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          <span>退出<span className="hidden sm:inline">沉浸 (Esc)</span></span>
        </button>
      </div>

      {/* Center Main Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto w-full px-2">
        {/* Mode Label */}
        <div className="mb-4 flex items-center gap-2 text-sm sm:text-base font-medium tracking-wide">
          <span className={modeColor}>
            {mode === 'focus' ? '深度專注' : mode === 'shortBreak' ? '放鬆休息' : '長休息'}
          </span>
          {activeTask && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300 truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
                {activeTask.title}
              </span>
            </>
          )}
        </div>

        {/* Huge Monospace Digital Timer (scaled responsively for mobile screens) */}
        <div className="font-mono-numbers text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-bold tracking-tighter text-neutral-50 select-none">
          {timeFormatted}
        </div>

        {/* Minimal Actions */}
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={onResetTimer}
            title="重設計時器"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={onToggleTimer}
            className="flex h-16 w-32 items-center justify-center gap-2 rounded-2xl bg-white text-neutral-950 font-semibold text-lg hover:bg-neutral-200 transition-all shadow-xl shadow-white/10"
          >
            {timerState === 'running' ? (
              <>
                <Pause className="h-6 w-6 fill-current" />
                <span>暫停</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6 fill-current ml-0.5" />
                <span>繼續</span>
              </>
            )}
          </button>

          <button
            onClick={onSkipTimer}
            title="跳過此階段"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Nudge Time in Zen Mode */}
        {onNudgeTime && (
          <div className="mt-5 flex items-center gap-2 text-xs text-neutral-400">
            <button
              onClick={() => onNudgeTime(-300)}
              disabled={timeLeft <= 300}
              className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 hover:bg-neutral-800 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3 w-3" />
              <span>5m</span>
            </button>
            <span className="text-[11px] text-neutral-600">調整時間</span>
            <button
              onClick={() => onNudgeTime(300)}
              className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>5m</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom status & sound control */}
      <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>空白鍵快捷暫停 / 播放</span>
        </div>

        {/* Ambient Sound Controller */}
        <button
          onClick={onToggleAmbient}
          className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-1.5 text-neutral-300 hover:text-white transition-colors"
        >
          {ambientPlaying ? (
            <>
              <Volume2 className="h-4 w-4 text-rose-400" />
              <span>白噪音已開啟 ({settings.ambientSound})</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-neutral-500" />
              <span>白噪音已靜音</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
