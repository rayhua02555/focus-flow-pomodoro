import React from 'react';
import { Clock, Flame, CheckCircle, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { FocusSession, Task } from '../types';

interface StatsViewProps {
  sessions: FocusSession[];
  tasks: Task[];
  onClearHistory: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  sessions,
  tasks,
  onClearHistory,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's stats
  const todaySessions = sessions.filter(
    (s) => s.date === todayStr && s.mode === 'focus'
  );
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayPomodoros = todaySessions.length;

  // Total all-time stats
  const totalFocusSessions = sessions.filter((s) => s.mode === 'focus');
  const totalMinutes = totalFocusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Consecutive streak calculation
  const getStreakDays = (): number => {
    const dates = Array.from(new Set(totalFocusSessions.map((s) => s.date))).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();

    // Check if user has focused today, if not check if focused yesterday
    const todayRecorded = dates.includes(todayStr);
    if (!todayRecorded) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!dates.includes(yesterdayStr)) {
        return 0;
      }
    }

    // Count backwards
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (todayRecorded ? i : i + 1));
      const str = d.toISOString().split('T')[0];
      if (dates.includes(str)) {
        streak++;
      } else {
        break;
      }
    }
    return Math.max(streak, 1);
  };

  const streak = totalFocusSessions.length > 0 ? getStreakDays() : 0;

  // 7-day past data for bar chart
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('zh-TW', { weekday: 'short' });
    const dayNum = `${d.getMonth() + 1}/${d.getDate()}`;
    const daySessions = sessions.filter(
      (s) => s.date === dateStr && s.mode === 'focus'
    );
    const dayMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      dateStr,
      dayLabel,
      dayNum,
      minutes: dayMins,
      count: daySessions.length,
    };
  });

  const maxMinutesInWeek = Math.max(...last7Days.map((d) => d.minutes), 60);

  // Category breakdown calculation based on task titles
  const categoryCounts: Record<string, number> = {};
  totalFocusSessions.forEach((s) => {
    const cat = s.taskTitle ? '專案任務' : '自由專注';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + s.durationMinutes;
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-4 space-y-6">
      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            專注數據與產能洞察
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            記錄每一刻專注時光，見證深層思考累積的成果
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">今日專注時長</span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {todayMinutes}
            </span>
            <span className="text-xs text-neutral-500">分鐘</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            相當於 {(todayMinutes / 60).toFixed(1)} 小時深度沉浸
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">今日完成番茄</span>
            <span className="text-sm">🍅</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {todayPomodoros}
            </span>
            <span className="text-xs text-neutral-500">顆</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            累積完成 {todaySessions.length} 個標準週期
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">連續專注天數</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {streak}
            </span>
            <span className="text-xs text-neutral-500">天連勝</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            保持規律是維持高產能的關鍵
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">歷史累計專注</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {totalHours}
            </span>
            <span className="text-xs text-neutral-500">小時</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            共完成 {totalFocusSessions.length} 顆番茄鐘
          </div>
        </div>
      </div>

      {/* 7-Day Focus Bar Chart */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              近 7 天專注趨勢
            </h3>
          </div>
          <span className="text-xs text-neutral-500">單位：分鐘</span>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-neutral-100 dark:border-neutral-800">
          {last7Days.map((day) => {
            const heightPercent = Math.max((day.minutes / maxMinutesInWeek) * 100, 4);
            const isToday = day.dateStr === todayStr;

            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.minutes}m
                </span>

                <div className="w-full max-w-[36px] bg-neutral-100 dark:bg-neutral-800 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-rose-500'
                        : day.minutes > 0
                        ? 'bg-rose-400/80 group-hover:bg-rose-500 dark:bg-rose-600/70 dark:group-hover:bg-rose-500'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                </div>

                <div className="text-center">
                  <div
                    className={`text-[11px] font-medium ${
                      isToday
                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {day.dayLabel}
                  </div>
                  <div className="text-[9px] text-neutral-400">{day.dayNum}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions History Table */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-neutral-900/90">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            最近專注紀錄
          </h3>
          {sessions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>清空紀錄</span>
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">
            尚無專注紀錄，開始第一個番茄鐘後會在此顯示！
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">
                    {session.mode === 'focus' ? '🍅' : '☕'}
                  </span>
                  <div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {session.taskTitle || (session.mode === 'focus' ? '自主深度專注' : '休息時段')}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {new Date(session.timestamp).toLocaleString('zh-TW', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    +{session.durationMinutes} 分鐘
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
