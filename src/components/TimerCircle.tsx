import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus, Pin, Sliders, Edit2 } from 'lucide-react';
import { Mode, Task, TimerState } from '../types';

interface TimerCircleProps {
  mode: Mode;
  onSelectMode: (mode: Mode) => void;
  timeLeft: number;
  totalTime: number;
  timerState: TimerState;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onNudgeTime: (deltaSeconds: number) => void;
  onSelectPresetMinutes: (minutes: number) => void;
  onOpenCustomTimeModal: () => void;
  pomodoroCycle: number; // 1 to 4
  longBreakInterval: number;
  activeTask?: Task;
  onClearActiveTask: () => void;
  onSwitchToTasksView: () => void;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  mode,
  onSelectMode,
  timeLeft,
  totalTime,
  timerState,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onNudgeTime,
  onSelectPresetMinutes,
  onOpenCustomTimeModal,
  pomodoroCycle,
  longBreakInterval,
  activeTask,
  onClearActiveTask,
  onSwitchToTasksView,
}) => {
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (1 = full, 0 = empty)
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;

  // SVG parameters
  const size = 320;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Mode color classes
  const getThemeColors = () => {
    switch (mode) {
      case 'focus':
        return {
          text: 'text-rose-500 dark:text-rose-400',
          bg: 'bg-rose-500',
          gradientStart: '#fb7185',
          gradientEnd: '#e11d48',
          border: 'border-rose-200 dark:border-rose-900/60',
          glow: 'shadow-rose-500/20',
          buttonPrimary: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25',
          pulse: 'ring-rose-400/20',
        };
      case 'shortBreak':
        return {
          text: 'text-emerald-500 dark:text-emerald-400',
          bg: 'bg-emerald-500',
          gradientStart: '#34d399',
          gradientEnd: '#059669',
          border: 'border-emerald-200 dark:border-emerald-900/60',
          glow: 'shadow-emerald-500/20',
          buttonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25',
          pulse: 'ring-emerald-400/20',
        };
      case 'longBreak':
        return {
          text: 'text-indigo-500 dark:text-indigo-400',
          bg: 'bg-indigo-500',
          gradientStart: '#818cf8',
          gradientEnd: '#4f46e5',
          border: 'border-indigo-200 dark:border-indigo-900/60',
          glow: 'shadow-indigo-500/20',
          buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25',
          pulse: 'ring-indigo-400/20',
        };
    }
  };

  const theme = getThemeColors();

  // Quick preset minutes for current mode
  const quickPresets =
    mode === 'focus'
      ? [15, 25, 45, 60]
      : mode === 'shortBreak'
      ? [3, 5, 10]
      : [15, 20, 30];

  const currentDurationMinutes = Math.round(totalTime / 60);

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-6">
      {/* Mode Selector Tabs */}
      <div className="mb-3 sm:mb-4 flex items-center gap-1 rounded-2xl bg-neutral-100 p-1.5 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
        <button
          onClick={() => onSelectMode('focus')}
          className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all ${
            mode === 'focus'
              ? 'bg-white text-rose-600 shadow-sm dark:bg-neutral-800 dark:text-rose-400 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          專注時段
        </button>
        <button
          onClick={() => onSelectMode('shortBreak')}
          className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all ${
            mode === 'shortBreak'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-neutral-800 dark:text-emerald-400 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          短休息
        </button>
        <button
          onClick={() => onSelectMode('longBreak')}
          className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all ${
            mode === 'longBreak'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-neutral-800 dark:text-indigo-400 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          }`}
        >
          長休息
        </button>
      </div>

      {/* Quick Presets & Custom Time Trigger Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1 hidden sm:inline">
          自訂長度:
        </span>
        {quickPresets.map((mins) => {
          const isActive = currentDurationMinutes === mins;
          return (
            <button
              key={mins}
              onClick={() => onSelectPresetMinutes(mins)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {mins}m
            </button>
          );
        })}
        <button
          onClick={onOpenCustomTimeModal}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 font-medium transition-colors border border-rose-200/50 dark:border-rose-900/50"
          title="自訂精確分鐘與秒數"
        >
          <Sliders className="h-3 w-3" />
          <span>更多自訂...</span>
        </button>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center">
        {/* Subtle breathing glow ring when running */}
        <div
          className={`absolute w-[min(290px,76vw)] h-[min(290px,76vw)] sm:h-[330px] sm:w-[330px] rounded-full transition-all duration-1000 ${
            timerState === 'running'
              ? 'ring-8 ring-offset-4 ring-offset-transparent animate-pulse ' + theme.pulse
              : 'opacity-0'
          }`}
        />

        <svg
          className="w-[min(290px,76vw)] h-[min(290px,76vw)] sm:h-[330px] sm:w-[330px] -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.gradientStart} />
              <stop offset="100%" stopColor={theme.gradientEnd} />
            </linearGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-neutral-200 dark:stroke-neutral-800/90 fill-none"
          />

          {/* Foreground animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="url(#timerGradient)"
            className="fill-none transition-[stroke-dashoffset] duration-700 ease-linear"
          />
        </svg>

        {/* Center Countdown & Details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {/* Current cycle indicator */}
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>第 {pomodoroCycle} / {longBreakInterval} 番茄週期</span>
          </div>

          {/* Large Monospace Timer Display - Clickable to customize time! */}
          <button
            onClick={onOpenCustomTimeModal}
            title="點擊直接自訂計時器時間"
            className="group relative flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            <div className="font-mono-numbers text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-rose-500 transition-colors select-none">
              {timeFormatted}
            </div>
            <Edit2 className="absolute -right-5 sm:-right-6 top-1 h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Mode label & state */}
          <div className="mt-1 flex items-center gap-1 text-xs sm:text-sm font-medium">
            <span className={theme.text}>
              {mode === 'focus' ? '深度專注中' : mode === 'shortBreak' ? '放鬆喝口水' : '充足恢復長休息'}
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {timerState === 'running' ? '計時中' : timerState === 'paused' ? '已暫停' : '準備就緒'}
            </span>
          </div>

          {/* Active bound task display */}
          <div className="mt-3.5 max-w-[210px] sm:max-w-[240px]">
            {activeTask ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100/90 dark:bg-neutral-900/90 px-2.5 py-1 text-xs border border-neutral-200/60 dark:border-neutral-800">
                <Pin className="h-3 w-3 shrink-0 text-rose-500" />
                <span className="truncate text-neutral-800 dark:text-neutral-200 font-medium">
                  {activeTask.title}
                </span>
                <button
                  onClick={onClearActiveTask}
                  className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  title="解除關聯"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={onSwitchToTasksView}
                className="text-[11px] sm:text-xs text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
              >
                + 連結專注任務
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cycle progress indicators (dots) */}
      <div className="mt-5 flex items-center gap-2">
        {Array.from({ length: longBreakInterval }).map((_, i) => {
          const isDone = i + 1 < pomodoroCycle;
          const isCurrent = i + 1 === pomodoroCycle;
          return (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isDone
                  ? 'w-6 bg-rose-500'
                  : isCurrent
                  ? 'w-8 bg-rose-400 ring-2 ring-rose-400/30'
                  : 'w-2.5 bg-neutral-200 dark:bg-neutral-800'
              }`}
              title={`第 ${i + 1} 個番茄鐘`}
            />
          );
        })}
      </div>

      {/* Main Control Actions */}
      <div className="mt-6 flex items-center gap-3 sm:gap-4">
        {/* Reset button */}
        <button
          onClick={onResetTimer}
          title="重設當前計時器"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-850 dark:hover:text-white transition-all active:scale-95"
          aria-label="重設"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {/* Primary Start / Pause button */}
        <button
          onClick={onToggleTimer}
          className={`flex h-14 sm:h-16 px-8 sm:px-10 items-center justify-center gap-2.5 rounded-2xl font-semibold text-base sm:text-lg transition-all active:scale-[0.98] ${theme.buttonPrimary}`}
        >
          {timerState === 'running' ? (
            <>
              <Pause className="h-6 w-6 fill-current" />
              <span>暫停</span>
            </>
          ) : (
            <>
              <Play className="h-6 w-6 fill-current ml-0.5" />
              <span>{timerState === 'paused' ? '繼續' : '開始專注'}</span>
            </>
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={onSkipTimer}
          title="跳過此階段"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-850 dark:hover:text-white transition-all active:scale-95"
          aria-label="跳過"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Time Nudge Buttons: Quick on-the-fly +/- adjustments */}
      <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onNudgeTime(-300)}
          disabled={timeLeft <= 300}
          title="減少 5 分鐘"
          className="flex items-center gap-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors"
        >
          <Minus className="h-3 w-3" />
          <span>5m</span>
        </button>
        <button
          onClick={() => onNudgeTime(-60)}
          disabled={timeLeft <= 60}
          title="減少 1 分鐘"
          className="flex items-center gap-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40 transition-colors"
        >
          <Minus className="h-3 w-3" />
          <span>1m</span>
        </button>

        <span className="text-[11px] text-neutral-400 mx-1">微調時間</span>

        <button
          onClick={() => onNudgeTime(60)}
          title="增加 1 分鐘"
          className="flex items-center gap-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>1m</span>
        </button>
        <button
          onClick={() => onNudgeTime(300)}
          title="增加 5 分鐘"
          className="flex items-center gap-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>5m</span>
        </button>
      </div>
    </div>
  );
};
