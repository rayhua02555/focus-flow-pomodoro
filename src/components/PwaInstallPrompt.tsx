import React, { useState, useEffect } from 'react';
import { Download, Share, X, Smartphone, Check, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallPromptProps {
  // Can be manually opened from Header or Settings
  forceOpen?: boolean;
  onCloseForceOpen?: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  forceOpen,
  onCloseForceOpen,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // Check if user dismissed banner recently
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
    const isRecentlyDismissed =
      dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000;

    // Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isRecentlyDismissed && !isStandaloneMode) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccessfully(true);
      setTimeout(() => setInstalledSuccessfully(false), 5000);
    });

    // If on iOS and not standalone and not recently dismissed, show banner after brief delay
    if (isAppleDevice && !isStandaloneMode && !isRecentlyDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_prompt_dismissed_at', String(Date.now()));
  };

  // If already standalone and not force-opened, don't show
  if (isStandalone && !forceOpen) return null;

  const isModalOpen = forceOpen || showIosGuide;

  return (
    <>
      {/* 1. Subtle Floating Bottom Banner for First-time mobile visitors */}
      {showBanner && !isModalOpen && !isStandalone && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm rounded-2xl border border-rose-500/30 bg-neutral-900/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 shadow-md shadow-rose-500/25">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  安裝為手機 App
                  <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-normal">
                    PWA
                  </span>
                </h4>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  享受全螢幕無網址列、支援完全離線運行
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-white p-1 -mr-1 -mt-1"
              aria-label="關閉"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 px-3 text-xs font-semibold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-md shadow-rose-600/30"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isIos ? '查看安裝步驟' : '立即安裝 App'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700"
            >
              稍後再說
            </button>
          </div>
        </div>
      )}

      {/* 2. Success Toast Notification */}
      {installedSuccessfully && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in fade-in duration-200">
          <Check className="h-4 w-4" />
          <span>恭喜！已成功將番茄鐘安裝至主畫面</span>
        </div>
      )}

      {/* 3. Detailed Install / iOS Guide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">手機 App 安裝教學</h3>
              </div>
              <button
                onClick={() => {
                  setShowIosGuide(false);
                  if (onCloseForceOpen) onCloseForceOpen();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              {isStandalone ? (
                <div className="text-center py-2 space-y-2">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    已處於獨立 App 模式！
                  </h4>
                  <p className="text-xs text-neutral-500">
                    您已將此番茄鐘安裝至手機，享有原生全螢幕、離線運作與極致流暢體驗。
                  </p>
                </div>
              ) : isIos ? (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    在 iPhone / iPad Safari 上，請按照以下兩步驟將 App 加入主畫面：
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        1
                      </span>
                      <div>
                        <span className="font-semibold block text-neutral-800 dark:text-neutral-200">
                          點擊 Safari 底部「分享」圖標
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          點擊螢幕正下方的分享按鈕 <Share className="h-3.5 w-3.5 inline text-rose-500" />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        2
                      </span>
                      <div>
                        <span className="font-semibold block text-neutral-800 dark:text-neutral-200">
                          向下滾動並選擇「加入主畫面」
                        </span>
                        <span className="text-[11px] text-neutral-400 mt-0.5 block">
                          點擊「加入」即可在手機桌面生成專屬番茄鐘圖示！
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    您的裝置支援一鍵安裝 PWA 應用程式：
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>立即一鍵安裝到手機主畫面</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <p>在 Android Chrome 或其他瀏覽器中：</p>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      1. 點擊瀏覽器右上角選單 (三個點 ⋮)
                    </p>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      2. 選擇「加到主螢幕」或「安裝應用程式」
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-right">
              <button
                onClick={() => {
                  setShowIosGuide(false);
                  if (onCloseForceOpen) onCloseForceOpen();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
