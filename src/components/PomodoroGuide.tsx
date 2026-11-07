import React from 'react';
import { Target, Timer, Coffee, Award, ShieldAlert, Sparkles, Keyboard } from 'lucide-react';

export const PomodoroGuide: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '選定單一任務',
      description: '從任務清單挑選最重要的一件事。在計時開始前明確定義「完成的標準」，拒絕多工干擾。',
      icon: Target,
      color: 'text-rose-500',
    },
    {
      num: '02',
      title: '專注計時 25 分鐘',
      description: '啟動番茄鐘與白噪音，完全屏蔽社交媒體與雜訊。保持單一注意力，進入深度心流。',
      icon: Timer,
      color: 'text-rose-500',
    },
    {
      num: '03',
      title: '短暫放鬆 5 分鐘',
      description: '鈴響立刻停下手邊工作。站起身、倒杯水、眺望窗外或伸展，讓大腦的神經網路沉澱整合。',
      icon: Coffee,
      color: 'text-emerald-500',
    },
    {
      num: '04',
      title: '每 4 個番茄享受長休息',
      description: '完成一組（4 個番茄鐘）後，進行 15-30 分鐘充足長休息，徹底消除精神疲憊，迎接下個高效區段。',
      icon: Award,
      color: 'text-indigo-500',
    },
  ];

  const tips = [
    {
      title: '番茄鐘是不可分割的時間原子',
      content: '一個番茄鐘（25分鐘）一旦開始，就不能被打斷。若有突發想法，隨手記在任務備註，鐘響後再處理。',
    },
    {
      title: '校準時間感知力',
      content: '剛開始任務可能難以精確估計。透過持續記錄預估與實際花費的番茄數，你會對自己的產能節奏越來越了解。',
    },
    {
      title: '休息時嚴禁滑短影片與社群',
      content: '滑手機不是休息，反而會消耗更多認知資源。真正的休息是物理離開螢幕、閉目養神或適度補水。',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          番茄工作法核心心法
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          由法蘭西斯科·西里洛（Francesco Cirillo）創立的時間管理哲學，利用人體注意力生理週期，在規律的衝刺與放鬆中激發極致專注。
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="rounded-2xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-neutral-900/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500">
                      STEP {step.num}
                    </span>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {step.title}
                    </h3>
                  </div>
                  <Icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Productivity Golden Rules */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-neutral-900/90">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            高產能實戰避坑指南
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((t, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/50"
            >
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
                {t.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Cheatsheet */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
        <div className="flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4 text-neutral-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            鍵盤快速鍵指南
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-neutral-600 dark:text-neutral-400">開始 / 暫停計時</span>
            <kbd className="px-2 py-0.5 rounded-md bg-neutral-200 font-mono text-xs dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              Space
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-neutral-600 dark:text-neutral-400">退出全螢幕 Zen 模式</span>
            <kbd className="px-2 py-0.5 rounded-md bg-neutral-200 font-mono text-xs dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              Esc
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-neutral-600 dark:text-neutral-400">白噪音即時調音</span>
            <kbd className="px-2 py-0.5 rounded-md bg-neutral-200 font-mono text-xs dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              右上角喇叭
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
