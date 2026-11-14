import React, { useState, useEffect } from 'react';
import { X, Clock, Check, Sparkles } from 'lucide-react';
import { Mode } from '../types';

interface CustomTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  currentDurationSeconds: number;
  onApplyCustomTime: (totalSeconds: number, saveAsDefault: boolean, startImmediately: boolean) => void;
}

export const CustomTimeModal: React.FC<CustomTimeModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentDurationSeconds,
  onApplyCustomTime,
}) => {
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(true);

  // Sync state whenever the modal opens or current duration changes
  useEffect(() => {
    if (isOpen) {
      const curM = Math.floor(currentDurationSeconds / 60);
      const curS = currentDurationSeconds % 60;
      setMinutes(curM);
      setSeconds(curS);
    }
  }, [isOpen, currentDurationSeconds]);

  if (!isOpen) return null;

  const modeName =
    mode === 'focus' ? '專注時段' : mode === 'shortBreak' ? '短休息' : '長休息';

  const presetsByMode: Record<Mode, number[]> = {
    focus: [15, 20, 25, 30, 45, 50, 60, 90],
    shortBreak: [3, 5, 8, 10, 15],
    longBreak: [10, 15, 20, 25, 30, 45],
  };

  const presets = presetsByMode[mode];

  const handleApply = (startImmediately: boolean = false) => {
    const total = Math.max(1, minutes * 60 + seconds);
    onApplyCustomTime(total, saveAsDefault, startImmediately);
    onClose();
  };

  const totalCalculatedSeconds = minutes * 60 + seconds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 transition-colors animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-500" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              自訂「{modeName}」時間
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-5 space-y-5">
          {/* Main Digits Input */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-neutral-500 mb-1">分鐘</span>
              <div className="flex items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="180"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(180, Number(e.target.value))))}
                  className="w-20 sm:w-24 text-center rounded-2xl border border-neutral-300 bg-neutral-50 p-3 font-mono-numbers text-3xl sm:text-4xl font-bold text-neutral-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>

            <span className="text-3xl font-bold text-neutral-400 pt-5">:</span>

            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-neutral-500 mb-1">秒數 (0-59)</span>
              <div className="flex items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-20 sm:w-24 text-center rounded-2xl border border-neutral-300 bg-neutral-50 p-3 font-mono-numbers text-3xl sm:text-4xl font-bold text-neutral-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Quick seconds & minutes test chips */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-neutral-400">快速秒數：</span>
            {[10, 20, 30, 45].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSeconds(sec)}
                className={`px-2 py-1 rounded-md font-mono transition-colors ${
                  seconds === sec
                    ? 'bg-rose-500 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {sec}秒
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSeconds(0)}
              className="px-2 py-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              歸零
            </button>
          </div>

          {/* Quick Preset Minutes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              常用分鐘推薦
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((min) => {
                const isSelected = minutes === min && seconds === 0;
                return (
                  <button
                    type="button"
                    key={min}
                    onClick={() => {
                      setMinutes(min);
                      setSeconds(0);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-colors ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {min} 分鐘
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider for smooth minute adjustments */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
              <span>滑動快速調節分鐘</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                {minutes} 分 {seconds > 0 ? `${seconds} 秒` : ''} ({totalCalculatedSeconds} 秒)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={mode === 'focus' ? '90' : '30'}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
            />
          </div>

          {/* Checkbox: Save as default for this mode */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="h-4 w-4 rounded-md border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <span className="text-xs text-neutral-700 dark:text-neutral-300">
              儲存為「{modeName}」未來的預設時間（精確保存至秒）
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => handleApply(false)}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200 font-medium text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            套用設定 ({String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')})
          </button>
          <button
            type="button"
            onClick={() => handleApply(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 shadow-sm shadow-rose-600/20 transition-colors"
          >
            立即開始
          </button>
        </div>
      </div>
    </div>
  );
};
