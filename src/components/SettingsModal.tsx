import React, { useState, useEffect } from 'react';
import { X, Bell, Volume2, RotateCcw, Check, Sparkles, Palette } from 'lucide-react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { requestNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenBackgroundModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenBackgroundModal,
}) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleTestAlarm = (tone: AppSettings['alarmTone']) => {
    audioEngine.playAlarm(tone, draft.soundVolume);
  };

  const handleTestTick = (tick: AppSettings['tickSound']) => {
    if (tick !== 'none') {
      audioEngine.playTick(tick, draft.soundVolume);
    }
  };

  const handleToggleNotifications = async () => {
    if (!draft.desktopNotifications) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setDraft((prev) => ({ ...prev, desktopNotifications: true }));
        setNotificationStatus('已取得桌面推播通知權限');
      } else {
        setNotificationStatus('瀏覽器未授予推播通知權限');
      }
    } else {
      setDraft((prev) => ({ ...prev, desktopNotifications: false }));
      setNotificationStatus('');
    }
  };

  const handleSave = () => {
    onSaveSettings(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_SETTINGS, theme: draft.theme });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              計時器與偏好設定
            </h2>
            <p className="text-xs text-neutral-500">客製化你的專注節奏與聲音體驗</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Section 1: Durations */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              時間長度（分鐘）
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  專注時長
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="180"
                  value={draft.focusDuration}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setDraft((p) => ({ ...p, focusDuration: val, focusSeconds: val * 60 }));
                  }}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  短休息
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="60"
                  value={draft.shortBreakDuration}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setDraft((p) => ({ ...p, shortBreakDuration: val, shortBreakSeconds: val * 60 }));
                  }}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  長休息
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="90"
                  value={draft.longBreakDuration}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setDraft((p) => ({ ...p, longBreakDuration: val, longBreakSeconds: val * 60 }));
                  }}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">長休息間隔（番茄數）:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="2"
                  max="12"
                  value={draft.longBreakInterval}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      longBreakInterval: Math.max(2, Number(e.target.value)),
                    }))
                  }
                  className="w-16 rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-center font-mono dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
                <span className="text-neutral-500">個番茄鐘</span>
              </div>
            </div>
          </div>

          {/* Section 2: Automation */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              自動流程
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  專注結束後自動開始休息
                </span>
                <input
                  type="checkbox"
                  checked={draft.autoStartBreaks}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, autoStartBreaks: e.target.checked }))
                  }
                  className="h-4 w-4 rounded-md border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  休息結束後自動開始下一個專注
                </span>
                <input
                  type="checkbox"
                  checked={draft.autoStartFocus}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, autoStartFocus: e.target.checked }))
                  }
                  className="h-4 w-4 rounded-md border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Sounds */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              聲音與提示
            </h3>

            {/* Alarm Tone */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  結束提醒音效
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bell', name: '禪意頌缽 (Bell)' },
                    { id: 'marimba', name: '溫潤馬林巴 (Marimba)' },
                    { id: 'beep', name: '經典電子音 (Beep)' },
                    { id: 'crystal', name: '空靈水晶 (Crystal)' },
                  ].map((tone) => (
                    <div
                      key={tone.id}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer ${
                        draft.alarmTone === tone.id
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                      }`}
                      onClick={() =>
                        setDraft((p) => ({ ...p, alarmTone: tone.id as AppSettings['alarmTone'] }))
                      }
                    >
                      <span>{tone.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAlarm(tone.id as AppSettings['alarmTone']);
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-500"
                        title="試聽音效"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticking sound */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  秒針滴答聲 (專注計時中)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', name: '關閉' },
                    { id: 'clock', name: '機械掛鐘' },
                    { id: 'wood', name: '溫潤木塊' },
                    { id: 'drop', name: '靜心水滴' },
                  ].map((tick) => (
                    <button
                      type="button"
                      key={tick.id}
                      onClick={() => {
                        setDraft((p) => ({ ...p, tickSound: tick.id as AppSettings['tickSound'] }));
                        handleTestTick(tick.id as AppSettings['tickSound']);
                      }}
                      className={`py-1.5 px-2 rounded-xl border text-xs text-center transition-colors ${
                        draft.tickSound === tick.id
                          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 font-medium text-rose-600 dark:text-rose-400'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {tick.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound volume slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-600 dark:text-neutral-400">提醒與音效音量:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {draft.soundVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={draft.soundVolume}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, soundVolume: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notifications */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              系統通知
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                  啟用桌面推播提醒
                </span>
                <span className="text-[11px] text-neutral-400">
                  當切換到其他瀏覽器分頁時，計時結束會發送通知
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  draft.desktopNotifications
                    ? 'bg-rose-600 text-white'
                    : 'border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                <span>{draft.desktopNotifications ? '已啟用' : '點擊授權'}</span>
              </button>
            </div>
            {notificationStatus && (
              <p className="text-[11px] text-rose-500 mt-1.5">{notificationStatus}</p>
            )}
          </div>

          {/* Section 5: Appearance & Background */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              外觀與背景風格
            </h3>
            <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                    背景桌布與氛圍微調
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    目前風格: {draft.background?.type === 'default' ? '極簡原生' : draft.background?.presetId}
                  </span>
                </div>
              </div>
              {onOpenBackgroundModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBackgroundModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  自訂背景
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>恢復預設值</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 shadow-sm shadow-rose-600/20"
            >
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
