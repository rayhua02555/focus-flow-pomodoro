import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Upload,
  Link as LinkIcon,
  Sliders,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Palette,
  Eye,
} from 'lucide-react';
import { BackgroundConfig, DEFAULT_BACKGROUND } from '../types';
import { BACKGROUND_PRESETS, BackgroundPreset } from '../utils/backgroundPresets';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  background: BackgroundConfig;
  onSaveBackground: (bg: BackgroundConfig) => void;
}

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  background,
  onSaveBackground,
}) => {
  const [draft, setDraft] = useState<BackgroundConfig>(background);
  const [activeTab, setActiveTab] = useState<'all' | 'gradient' | 'wallpaper' | 'custom'>('all');
  const [customUrlInput, setCustomUrlInput] = useState<string>(
    draft.type === 'custom' && draft.customUrl && !draft.customUrl.startsWith('data:')
      ? draft.customUrl
      : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraft(background);
      setCustomUrlInput(
        background.type === 'custom' && background.customUrl && !background.customUrl.startsWith('data:')
          ? background.customUrl
          : ''
      );
    }
  }, [isOpen, background]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: BackgroundPreset) => {
    const updated: BackgroundConfig = {
      ...draft,
      type: preset.type,
      presetId: preset.id,
    };
    setDraft(updated);
    onSaveBackground(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請選擇有效的圖片檔案 (JPG, PNG, WebP)');
      return;
    }

    // Limit to ~4MB to prevent localStorage overflow
    if (file.size > 4 * 1024 * 1024) {
      alert('圖片檔案較大 (大於 4MB)，建議使用較小的圖片或使用圖片網址以避免瀏覽器空間限制。');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updated: BackgroundConfig = {
          ...draft,
          type: 'custom',
          presetId: 'custom',
          customUrl: result,
        };
        setDraft(updated);
        onSaveBackground(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const updated: BackgroundConfig = {
      ...draft,
      type: 'custom',
      presetId: 'custom',
      customUrl: customUrlInput.trim(),
    };
    setDraft(updated);
    onSaveBackground(updated);
  };

  const handleReset = () => {
    setDraft(DEFAULT_BACKGROUND);
    setCustomUrlInput('');
    onSaveBackground(DEFAULT_BACKGROUND);
  };

  const handleUpdateParam = (key: keyof BackgroundConfig, val: any) => {
    const updated = { ...draft, [key]: val };
    setDraft(updated);
    onSaveBackground(updated);
  };

  const filteredPresets = BACKGROUND_PRESETS.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white/95 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900/95 backdrop-blur-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-sm shrink-0">
              <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                背景與視覺風格
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500">自訂沉浸式背景桌布、質感漸層與氛圍微調</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            全部風格
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'gradient'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>質感漸層</span>
          </button>
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'wallpaper'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>精選桌布</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-emerald-500" />
            <span>自訂圖片</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
          {/* Custom Image Upload Panel (shown when custom tab is active or selected) */}
          {(activeTab === 'custom' || draft.type === 'custom') && (
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-emerald-500" />
                  上傳本機圖片或指定網址
                </span>
                {draft.type === 'custom' && draft.customUrl && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ● 目前正在使用自訂圖片
                  </span>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4 text-emerald-500" />
                    <span>點擊選取本機圖片 (JPG/PNG)</span>
                  </button>
                </div>

                {/* URL Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="url"
                      placeholder="貼上圖片 URL 連結..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCustomUrl();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors whitespace-nowrap"
                  >
                    套用
                  </button>
                </div>
              </div>

              {/* Current Custom Image Preview */}
              {draft.type === 'custom' && draft.customUrl && (
                <div className="relative h-24 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700 group">
                  <img
                    src={draft.customUrl}
                    alt="自訂背景預覽"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-4 text-white text-xs">
                    <span>已套用自訂背景</span>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(BACKGROUND_PRESETS[0])}
                      className="px-2.5 py-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-[11px] text-white"
                    >
                      移除自訂圖片
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preset Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                選擇主題預設
              </span>
              <span className="text-xs text-neutral-400">
                點擊立即切換即時預覽
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isSelected =
                  draft.type === preset.type && draft.presetId === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`relative group flex flex-col text-left rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {/* Visual Preview Box */}
                    <div
                      className="h-20 w-full relative flex items-center justify-center overflow-hidden"
                      style={
                        preset.type === 'default'
                          ? { backgroundColor: '#171717' }
                          : preset.type === 'gradient'
                          ? { background: preset.styleValue }
                          : {
                              backgroundImage: `url("${preset.styleValue}")`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                      }
                    >
                      {/* Subtle Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                      {preset.type === 'default' && (
                        <span className="relative z-10 text-[11px] font-mono text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded-md bg-neutral-900/60">
                          原生純粹
                        </span>
                      )}

                      {/* Selected Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-850/80">
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {preset.description || preset.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Controls (Only when non-default is selected) */}
          {draft.type !== 'default' && (
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <Sliders className="h-4 w-4 text-rose-500" />
                <span>視覺清晰度與氛圍微調</span>
              </div>

              {/* Slider 1: Dark Overlay Opacity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    背景暗部遮罩濃度（保證文字高對比與清晰度）:
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-500">
                    {draft.opacity}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400">明亮通透</span>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    step="5"
                    value={draft.opacity}
                    onChange={(e) =>
                      handleUpdateParam('opacity', Number(e.target.value))
                    }
                    className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
                  />
                  <span className="text-[10px] text-neutral-400">深邃沉靜</span>
                </div>
              </div>

              {/* Slider 2: Background Blur */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    背景模糊（營造毛玻璃專注感）:
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-500">
                    {draft.blur} px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400">清晰 (0)</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2"
                    value={draft.blur}
                    onChange={(e) => handleUpdateParam('blur', Number(e.target.value))}
                    className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
                  />
                  <span className="text-[10px] text-neutral-400">深層柔焦 (20)</span>
                </div>

                {/* Quick Blur Presets */}
                <div className="flex items-center gap-2 mt-2">
                  {[
                    { label: '原圖無模糊', px: 0 },
                    { label: '微透柔焦 (4px)', px: 4 },
                    { label: '朦朧毛玻璃 (10px)', px: 10 },
                  ].map((item) => (
                    <button
                      key={item.px}
                      type="button"
                      onClick={() => handleUpdateParam('blur', item.px)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        draft.blur === item.px
                          ? 'border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle: Apply to Zen Mode */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block">
                      同步套用到 Zen 全螢幕沉浸模式
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      開啟後，進入全螢幕專注時亦會顯示自訂背景與氛圍
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.applyToZen}
                    onChange={(e) =>
                      handleUpdateParam('applyToZen', e.target.checked)
                    }
                    className="h-4 w-4 rounded-md border-neutral-300 text-rose-600 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>還原系統預設</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};

