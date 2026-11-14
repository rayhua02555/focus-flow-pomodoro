export type Mode = 'focus' | 'shortBreak' | 'longBreak';

export type TimerState = 'idle' | 'running' | 'paused';

export interface Task {
  id: string;
  title: string;
  category: '工作' | '學習' | '創作' | '閱讀' | '生活' | '其他';
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mode: Mode;
  durationMinutes: number;
  taskId?: string;
  taskTitle?: string;
}

export type BackgroundType = 'default' | 'gradient' | 'wallpaper' | 'custom';

export interface BackgroundConfig {
  type: BackgroundType;
  presetId: string;
  customUrl?: string;
  blur: number; // 0 - 24 px
  opacity: number; // 10 - 90 %
  applyToZen: boolean;
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'default',
  presetId: 'default',
  customUrl: '',
  blur: 0,
  opacity: 35,
  applyToZen: true,
};

export interface AppSettings {
  focusDuration: number; // minutes for UI display
  shortBreakDuration: number; // minutes for UI display
  longBreakDuration: number; // minutes for UI display
  focusSeconds: number; // exact seconds source of truth (e.g. 1500 for 25m, or 30 for 30s)
  shortBreakSeconds: number; // exact seconds
  longBreakSeconds: number; // exact seconds
  longBreakInterval: number; // pomodoros
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  alarmTone: 'bell' | 'marimba' | 'beep' | 'crystal';
  tickSound: 'none' | 'clock' | 'wood' | 'drop';
  soundVolume: number; // 0-100
  ambientSound: 'none' | 'rain' | 'waves' | 'pink' | 'brown' | 'campfire';
  ambientVolume: number; // 0-100
  desktopNotifications: boolean;
  theme: 'dark' | 'light';
  background: BackgroundConfig;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  focusSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  alarmTone: 'bell',
  tickSound: 'none',
  soundVolume: 75,
  ambientSound: 'none',
  ambientVolume: 50,
  desktopNotifications: false,
  theme: 'dark',
  background: DEFAULT_BACKGROUND,
};
