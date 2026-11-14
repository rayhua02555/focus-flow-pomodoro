import { AppSettings, DEFAULT_SETTINGS, FocusSession, Task } from '../types';

const SETTINGS_KEY = 'pomodoro_settings_v1';
const TASKS_KEY = 'pomodoro_tasks_v1';
const HISTORY_KEY = 'pomodoro_history_v1';

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const focusSecs = parsed.focusSeconds ?? (parsed.focusDuration ? parsed.focusDuration * 60 : 25 * 60);
    const shortSecs = parsed.shortBreakSeconds ?? (parsed.shortBreakDuration ? parsed.shortBreakDuration * 60 : 5 * 60);
    const longSecs = parsed.longBreakSeconds ?? (parsed.longBreakDuration ? parsed.longBreakDuration * 60 : 15 * 60);
    const background = parsed.background
      ? { ...DEFAULT_SETTINGS.background, ...parsed.background }
      : DEFAULT_SETTINGS.background;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      focusSeconds: focusSecs,
      shortBreakSeconds: shortSecs,
      longBreakSeconds: longSecs,
      background,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      return [
        {
          id: 'task-1',
          title: '完成今日首要任務與目標規劃',
          category: '工作',
          estimatedPomodoros: 2,
          completedPomodoros: 1,
          completed: false,
          notes: '專注核心目標，排除一切分心干擾',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: '閱讀專業書籍或深度技術文檔 30 分鐘',
          category: '學習',
          estimatedPomodoros: 2,
          completedPomodoros: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-3',
          title: '整理桌面與舒緩眼部伸展',
          category: '生活',
          estimatedPomodoros: 1,
          completedPomodoros: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function getStoredHistory(): FocusSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      // Seed a few past sessions for rich immediate stats representation
      const today = new Date();
      const sessions: FocusSession[] = [];
      for (let i = 4; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        sessions.push(
          {
            id: `seed-${i}-1`,
            date: dateStr,
            timestamp: d.getTime() + 10 * 3600000,
            mode: 'focus',
            durationMinutes: 25,
            taskTitle: '專案核心開發與架構思考',
          },
          {
            id: `seed-${i}-2`,
            date: dateStr,
            timestamp: d.getTime() + 11 * 3600000,
            mode: 'focus',
            durationMinutes: 25,
            taskTitle: '系統優化與文檔整理',
          }
        );
      }
      return sessions;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: FocusSession[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}
