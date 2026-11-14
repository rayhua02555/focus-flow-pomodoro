import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppSettings,
  FocusSession,
  Mode,
  Task,
  TimerState,
  DEFAULT_SETTINGS,
} from './types';
import {
  getStoredHistory,
  getStoredSettings,
  getStoredTasks,
  saveStoredHistory,
  saveStoredSettings,
  saveStoredTasks,
} from './utils/storage';
import { audioEngine } from './utils/audioEngine';
import { fireConfetti, sendBrowserNotification } from './utils/notifications';
import { Header } from './components/Header';
import { TimerCircle } from './components/TimerCircle';
import { AmbientSoundPanel } from './components/AmbientSoundPanel';
import { TaskList } from './components/TaskList';
import { StatsView } from './components/StatsView';
import { PomodoroGuide } from './components/PomodoroGuide';
import { SettingsModal } from './components/SettingsModal';
import { ZenOverlay } from './components/ZenOverlay';
import { CustomTimeModal } from './components/CustomTimeModal';
import { BackgroundModal } from './components/BackgroundModal';
import { getBackgroundStyles } from './utils/backgroundPresets';
import { screenWakeLock } from './utils/wakeLock';
import { Timer, CheckSquare, BarChart2, BookOpen } from 'lucide-react';

export default function App() {
  // Load state from local storage
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [tasks, setTasks] = useState<Task[]>(() => getStoredTasks());
  const [history, setHistory] = useState<FocusSession[]>(() => getStoredHistory());

  // Views & Modals
  const [activeView, setActiveView] = useState<'timer' | 'tasks' | 'stats' | 'guide'>('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  // Timer core states
  const [mode, setMode] = useState<Mode>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [pomodoroCycle, setPomodoroCycle] = useState<number>(1);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(() => {
    const uncompleted = tasks.find((t) => !t.completed);
    return uncompleted ? uncompleted.id : undefined;
  });

  // Calculate duration in exact seconds for a given mode
  const getDurationSeconds = useCallback(
    (m: Mode) => {
      switch (m) {
        case 'focus':
          return settings.focusSeconds ?? settings.focusDuration * 60;
        case 'shortBreak':
          return settings.shortBreakSeconds ?? settings.shortBreakDuration * 60;
        case 'longBreak':
          return settings.longBreakSeconds ?? settings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const [timeLeft, setTimeLeft] = useState<number>(() => getDurationSeconds('focus'));
  const [totalTime, setTotalTime] = useState<number>(() => getDurationSeconds('focus'));

  // Ambient sound state
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);

  // Precision wall-clock target time refs (avoids tab throttling and drift)
  const targetEndTimeRef = useRef<number | null>(null);
  const lastSoundTickSecondRef = useRef<number | null>(null);

  // Apply theme on initial mount
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Synchronize browser tab title
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timerState === 'running') {
      const modeLabel = mode === 'focus' ? '專注中' : '休息中';
      document.title = `(${timeFormatted}) ${modeLabel} | 番茄鐘`;
    } else if (timerState === 'paused') {
      document.title = `(暫停 ${timeFormatted}) | 番茄鐘`;
    } else {
      document.title = 'Pomodoro Focus | 極簡質感番茄鐘';
    }
  }, [timeLeft, timerState, mode]);

  // Save changes to storage
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Ambient sound management
  const handleToggleAmbient = useCallback(() => {
    if (ambientPlaying) {
      audioEngine.stopAmbient();
      setAmbientPlaying(false);
    } else {
      const soundToPlay = settings.ambientSound === 'none' ? 'rain' : settings.ambientSound;
      if (settings.ambientSound === 'none') {
        setSettings((prev) => ({ ...prev, ambientSound: 'rain' }));
      }
      audioEngine.startAmbient(soundToPlay, settings.ambientVolume);
      setAmbientPlaying(true);
    }
  }, [ambientPlaying, settings.ambientSound, settings.ambientVolume]);

  const handleSelectAmbientSound = (sound: AppSettings['ambientSound']) => {
    setSettings((prev) => ({ ...prev, ambientSound: sound }));
    if (sound === 'none') {
      audioEngine.stopAmbient();
      setAmbientPlaying(false);
    } else {
      audioEngine.startAmbient(sound, settings.ambientVolume);
      setAmbientPlaying(true);
    }
  };

  // Switch timer mode
  const handleSelectMode = useCallback(
    (newMode: Mode) => {
      targetEndTimeRef.current = null;
      setMode(newMode);
      setTimerState('idle');
      const newDur = getDurationSeconds(newMode);
      setTimeLeft(newDur);
      setTotalTime(newDur);
    },
    [getDurationSeconds]
  );

  // When session completes
  const handleSessionComplete = useCallback(() => {
    targetEndTimeRef.current = null;
    audioEngine.playAlarm(settings.alarmTone, settings.soundVolume);

    const todayStr = new Date().toISOString().split('T')[0];

    if (mode === 'focus') {
      fireConfetti();

      // Find active task
      const activeTask = tasks.find((t) => t.id === activeTaskId);

      // Record focus session log
      const durationMins = Math.max(1, Math.round(totalTime / 60));
      const newSession: FocusSession = {
        id: `session-${Date.now()}`,
        date: todayStr,
        timestamp: Date.now(),
        mode: 'focus',
        durationMinutes: durationMins,
        taskId: activeTaskId,
        taskTitle: activeTask ? activeTask.title : undefined,
      };
      setHistory((prev) => [newSession, ...prev]);

      // Increment completed pomodoro on active task
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === activeTaskId) {
              const nextCompleted = t.completedPomodoros + 1;
              return {
                ...t,
                completedPomodoros: nextCompleted,
                completed: nextCompleted >= t.estimatedPomodoros ? true : t.completed,
              };
            }
            return t;
          })
        );
      }

      sendBrowserNotification(
        '專注時段完成！🍅',
        `太棒了！完成了 ${durationMins} 分鐘的高效專注，該好好休息一下了。`
      );

      // Advance cycle
      const isLongBreak = pomodoroCycle >= settings.longBreakInterval;
      const nextMode: Mode = isLongBreak ? 'longBreak' : 'shortBreak';
      const nextCycle = isLongBreak ? 1 : pomodoroCycle + 1;

      setPomodoroCycle(nextCycle);
      setMode(nextMode);

      const nextDur = getDurationSeconds(nextMode);
      setTimeLeft(nextDur);
      setTotalTime(nextDur);

      if (settings.autoStartBreaks) {
        targetEndTimeRef.current = Date.now() + nextDur * 1000;
        lastSoundTickSecondRef.current = nextDur;
        setTimerState('running');
      } else {
        setTimerState('idle');
      }
    } else {
      // Break session completed
      sendBrowserNotification('休息時間結束 🔔', '充電完畢！準備好開始下一個番茄鐘了嗎？');

      setMode('focus');
      const focusDur = getDurationSeconds('focus');
      setTimeLeft(focusDur);
      setTotalTime(focusDur);

      if (settings.autoStartFocus) {
        targetEndTimeRef.current = Date.now() + focusDur * 1000;
        lastSoundTickSecondRef.current = focusDur;
        setTimerState('running');
      } else {
        setTimerState('idle');
      }
    }
  }, [
    mode,
    tasks,
    activeTaskId,
    totalTime,
    pomodoroCycle,
    settings,
    getDurationSeconds,
  ]);

  // Wall-clock precision countdown interval
  useEffect(() => {
    if (timerState !== 'running') {
      targetEndTimeRef.current = null;
      return;
    }

    // Initialize target end time if not already established
    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      lastSoundTickSecondRef.current = timeLeft;
    }

    const intervalId = window.setInterval(() => {
      if (!targetEndTimeRef.current) return;

      const now = Date.now();
      const remainingMs = targetEndTimeRef.current - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      // Play tick sound once per distinct second if configured
      if (
        settings.tickSound !== 'none' &&
        remainingSeconds > 0 &&
        remainingSeconds !== lastSoundTickSecondRef.current
      ) {
        audioEngine.playTick(settings.tickSound, settings.soundVolume);
        lastSoundTickSecondRef.current = remainingSeconds;
      }

      if (remainingMs <= 0) {
        clearInterval(intervalId);
        targetEndTimeRef.current = null;
        setTimeLeft(0);
        handleSessionComplete();
      } else {
        setTimeLeft(remainingSeconds);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [timerState, timeLeft, settings.tickSound, settings.soundVolume, handleSessionComplete]);

  // Pre-unlock mobile Web Audio channel upon first user touch/tap
  useEffect(() => {
    const handleFirstTouch = () => {
      audioEngine.unlockMobileAudio();
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('click', handleFirstTouch, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  // Screen Wake Lock on mobile devices during active focus session
  useEffect(() => {
    if (timerState === 'running') {
      screenWakeLock.request();
    } else {
      screenWakeLock.release();
    }
    return () => {
      screenWakeLock.release();
    };
  }, [timerState]);

  // Page Visibility API listener for mobile background wake-up and tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      screenWakeLock.onVisibilityChange();

      if (
        document.visibilityState === 'visible' &&
        timerState === 'running' &&
        targetEndTimeRef.current
      ) {
        const remainingMs = targetEndTimeRef.current - Date.now();
        if (remainingMs <= 0) {
          targetEndTimeRef.current = null;
          setTimeLeft(0);
          handleSessionComplete();
        } else {
          setTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState, handleSessionComplete]);

  // Toggle timer action
  const handleToggleTimer = useCallback(() => {
    if (timerState === 'running') {
      // Pause: capture precise remaining seconds and clear target end time
      if (targetEndTimeRef.current) {
        const remainingMs = targetEndTimeRef.current - Date.now();
        const rem = Math.max(0, Math.ceil(remainingMs / 1000));
        setTimeLeft(rem);
      }
      targetEndTimeRef.current = null;
      setTimerState('paused');
    } else {
      // Start or Resume: calculate new target end time based on current timeLeft
      const effectiveLeft = timeLeft <= 0 ? totalTime : timeLeft;
      setTimeLeft(effectiveLeft);
      targetEndTimeRef.current = Date.now() + effectiveLeft * 1000;
      lastSoundTickSecondRef.current = effectiveLeft;
      setTimerState('running');
    }
  }, [timerState, timeLeft, totalTime]);

  // Reset timer action
  const handleResetTimer = useCallback(() => {
    targetEndTimeRef.current = null;
    setTimerState('idle');
    const dur = totalTime > 0 ? totalTime : getDurationSeconds(mode);
    setTimeLeft(dur);
    setTotalTime(dur);
  }, [totalTime, mode, getDurationSeconds]);

  // Skip timer action
  const handleSkipTimer = useCallback(() => {
    if (window.confirm('確定要跳過當前階段嗎？')) {
      handleSessionComplete();
    }
  }, [handleSessionComplete]);

  // Custom Time Handlers
  const handleApplyCustomTime = useCallback(
    (totalSeconds: number, saveAsDefault: boolean, startImmediately: boolean) => {
      targetEndTimeRef.current = null;
      setTimeLeft(totalSeconds);
      setTotalTime(totalSeconds);

      if (saveAsDefault) {
        const roundedMins = Math.max(1, Math.round(totalSeconds / 60));
        setSettings((prev) => {
          if (mode === 'focus') {
            return {
              ...prev,
              focusSeconds: totalSeconds,
              focusDuration: roundedMins,
            };
          } else if (mode === 'shortBreak') {
            return {
              ...prev,
              shortBreakSeconds: totalSeconds,
              shortBreakDuration: roundedMins,
            };
          } else {
            return {
              ...prev,
              longBreakSeconds: totalSeconds,
              longBreakDuration: roundedMins,
            };
          }
        });
      }

      if (startImmediately) {
        targetEndTimeRef.current = Date.now() + totalSeconds * 1000;
        lastSoundTickSecondRef.current = totalSeconds;
        setTimerState('running');
      } else {
        setTimerState('idle');
      }
    },
    [mode]
  );

  const handleSelectPresetMinutes = useCallback(
    (minutes: number) => {
      const seconds = minutes * 60;
      targetEndTimeRef.current = null;
      setTimeLeft(seconds);
      setTotalTime(seconds);
      setTimerState('idle');

      setSettings((prev) => {
        if (mode === 'focus') {
          return {
            ...prev,
            focusSeconds: seconds,
            focusDuration: minutes,
          };
        } else if (mode === 'shortBreak') {
          return {
            ...prev,
            shortBreakSeconds: seconds,
            shortBreakDuration: minutes,
          };
        } else {
          return {
            ...prev,
            longBreakSeconds: seconds,
            longBreakDuration: minutes,
          };
        }
      });
    },
    [mode]
  );

  const handleNudgeTime = useCallback((deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const updated = Math.max(1, prev + deltaSeconds);
      if (targetEndTimeRef.current) {
        targetEndTimeRef.current += deltaSeconds * 1000;
      }
      return updated;
    });
    setTotalTime((prev) => Math.max(1, prev + deltaSeconds));
  }, []);

  // Keyboard shortcut listener (Space = Toggle Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (
        e.code === 'Space' &&
        !isZenOpen &&
        !isCustomTimeOpen &&
        !isSettingsOpen &&
        !isBackgroundModalOpen
      ) {
        e.preventDefault();
        handleToggleTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleTimer, isZenOpen, isCustomTimeOpen, isSettingsOpen, isBackgroundModalOpen]);

  // Task actions
  const handleAddTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'completed'>
  ) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(undefined);
    }
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleClearHistory = () => {
    if (window.confirm('確定要清空所有專注歷史紀錄嗎？這項操作無法復原。')) {
      setHistory([]);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const bgStyles = getBackgroundStyles(settings.background);

  return (
    <div
      className={`relative min-h-screen text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors pb-24 md:pb-6 overflow-x-hidden ${
        !bgStyles.hasCustomBackground ? 'bg-neutral-50 dark:bg-neutral-950' : 'bg-neutral-950'
      }`}
    >
      {/* Dynamic Background Image / Gradient Layer */}
      {bgStyles.hasCustomBackground && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-500"
          style={bgStyles.wrapperStyle}
        />
      )}

      {/* Dynamic Contrast / Dimming Overlay */}
      {bgStyles.hasCustomBackground && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
          style={bgStyles.overlayStyle}
        />
      )}

      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
        onEnterZen={() => setIsZenOpen(true)}
        ambientPlaying={ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
        activeTaskTitle={activeTask?.title}
      />

      {/* Main Viewport Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'timer' && (
          <div className="space-y-8">
            <TimerCircle
              mode={mode}
              onSelectMode={handleSelectMode}
              timeLeft={timeLeft}
              totalTime={totalTime}
              timerState={timerState}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSkipTimer={handleSkipTimer}
              onNudgeTime={handleNudgeTime}
              onSelectPresetMinutes={handleSelectPresetMinutes}
              onOpenCustomTimeModal={() => setIsCustomTimeOpen(true)}
              pomodoroCycle={pomodoroCycle}
              longBreakInterval={settings.longBreakInterval}
              activeTask={activeTask}
              onClearActiveTask={() => setActiveTaskId(undefined)}
              onSwitchToTasksView={() => setActiveView('tasks')}
            />

            {/* Ambient Soundscapes Widget */}
            <div className="max-w-2xl mx-auto">
              <AmbientSoundPanel
                settings={settings}
                onUpdateSettings={setSettings}
                ambientPlaying={ambientPlaying}
                onToggleAmbient={handleToggleAmbient}
                onSelectAmbientSound={handleSelectAmbientSound}
              />
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSetActiveTask={(id) => {
              setActiveTaskId(id);
              setActiveView('timer');
            }}
            onAddTask={handleAddTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onClearActiveTask={() => setActiveTaskId(undefined)}
          />
        )}

        {activeView === 'stats' && (
          <StatsView
            sessions={history}
            tasks={tasks}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeView === 'guide' && <PomodoroGuide />}
      </main>

      {/* Mobile Bottom Navigation Bar with iOS safe-area support */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
          <button
            onClick={() => setActiveView('timer')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeView === 'timer'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Timer className="h-5 w-5" />
            <span className="text-[11px] mt-1">計時器</span>
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeView === 'tasks'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span className="text-[11px] mt-1">任務</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeView === 'stats'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-[11px] mt-1">統計</span>
          </button>

          <button
            onClick={() => setActiveView('guide')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeView === 'guide'
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[11px] mt-1">心法</span>
          </button>
        </div>
      </div>

      {/* Custom Time Modal */}
      <CustomTimeModal
        isOpen={isCustomTimeOpen}
        onClose={() => setIsCustomTimeOpen(false)}
        mode={mode}
        currentDurationSeconds={totalTime}
        onApplyCustomTime={handleApplyCustomTime}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          // If timer is idle, update duration immediately
          if (timerState === 'idle') {
            const nextDur =
              mode === 'focus'
                ? newSettings.focusSeconds ?? newSettings.focusDuration * 60
                : mode === 'shortBreak'
                ? newSettings.shortBreakSeconds ?? newSettings.shortBreakDuration * 60
                : newSettings.longBreakSeconds ?? newSettings.longBreakDuration * 60;
            setTimeLeft(nextDur);
            setTotalTime(nextDur);
          }
        }}
      />

      {/* Background Customization Modal */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        background={settings.background}
        onSaveBackground={(newBg) =>
          setSettings((prev) => ({ ...prev, background: newBg }))
        }
      />

      {/* Fullscreen Zen Overlay */}
      <ZenOverlay
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        mode={mode}
        timeLeft={timeLeft}
        timerState={timerState}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        onSkipTimer={handleSkipTimer}
        onNudgeTime={handleNudgeTime}
        activeTask={activeTask}
        settings={settings}
        ambientPlaying={ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
      />
    </div>
  );
}
