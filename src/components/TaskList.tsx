import React, { useState } from 'react';
import { Plus, Check, Trash2, Pin, Edit3, X, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { fireConfetti } from '../utils/notifications';

interface TaskListProps {
  tasks: Task[];
  activeTaskId?: string;
  onSetActiveTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'completed'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onClearActiveTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  onUpdateTask,
  onClearActiveTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Task['category']>('工作');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [notes, setNotes] = useState('');

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<Task['category']>('工作');
  const [editEstimated, setEditEstimated] = useState(2);
  const [editNotes, setEditNotes] = useState('');

  const categories: Task['category'][] = ['工作', '學習', '創作', '閱讀', '生活', '其他'];

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      estimatedPomodoros: Math.max(1, estimatedPomodoros),
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setEstimatedPomodoros(2);
    setIsAdding(false);
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditEstimated(task.estimatedPomodoros);
    setEditNotes(task.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editTitle.trim()) return;

    const existing = tasks.find((t) => t.id === editingTaskId);
    if (existing) {
      onUpdateTask({
        ...existing,
        title: editTitle.trim(),
        category: editCategory,
        estimatedPomodoros: editEstimated,
        notes: editNotes.trim() || undefined,
      });
    }
    setEditingTaskId(null);
  };

  const handleToggle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      fireConfetti();
    }
    onToggleTaskComplete(taskId);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalEstimated = tasks.reduce((acc, t) => acc + t.estimatedPomodoros, 0);
  const totalCompleted = tasks.reduce((acc, t) => acc + t.completedPomodoros, 0);

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      {/* Top Header & Task Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            專注任務清單
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>預估總計 {totalEstimated} 顆番茄</span>
            <span aria-hidden="true">·</span>
            <span>已完成 {totalCompleted} 顆番茄</span>
            <span aria-hidden="true">·</span>
            <span>
              已完成 {tasks.filter((t) => t.completed).length} / {tasks.length} 個任務
            </span>
          </div>
        </div>

        {/* Action Controls: Filter tabs & Add button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'active'
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              已完成
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 font-medium text-xs transition-colors shadow-xs shadow-rose-600/20"
          >
            {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{isAdding ? '取消' : '新增任務'}</span>
          </button>
        </div>
      </div>

      {/* Add Task Collapsible Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmitNew}
          className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                任務名稱
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：整理產品發布簡報、寫完第一章研究論文..."
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  類別
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        category === cat
                          ? 'bg-rose-600 text-white'
                          : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  預估番茄鐘數 (每個 25 分鐘)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-rose-500"
                  />
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 w-12 text-right">
                    {estimatedPomodoros} 🍅
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                備註（選填）
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="重要細節、連結或檢核項目..."
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-500 disabled:opacity-50"
              >
                建立任務
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {filter === 'completed'
                ? '尚無已完成的任務，完成一個番茄鐘後慶祝一下吧！'
                : '清單空空如也，點擊上方按鈕建立你的第一個專注任務'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isActive = activeTaskId === task.id;

            if (isEditing) {
              return (
                <form
                  key={task.id}
                  onSubmit={handleSaveEdit}
                  className="rounded-2xl border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    />
                    <div className="flex items-center gap-3">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as Task['category'])}
                        className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">預估：</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={editEstimated}
                          onChange={(e) => setEditEstimated(Number(e.target.value))}
                          className="w-16 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-medium"
                      >
                        儲存變更
                      </button>
                    </div>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-rose-400 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:border-neutral-700'
                }`}
              >
                {/* Left check & title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      task.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600'
                    }`}
                    title={task.completed ? '標記為未完成' : '標記為已完成'}
                  >
                    {task.completed && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium truncate ${
                          task.completed
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Unboxed Metadata Line with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">
                        {task.completedPomodoros} / {task.estimatedPomodoros} 🍅
                      </span>
                      {task.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[140px] sm:max-w-xs">{task.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls: Pin as active timer task, Edit, Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Pin active button */}
                  <button
                    onClick={() => {
                      if (isActive) {
                        onClearActiveTask();
                      } else {
                        onSetActiveTask(task.id);
                      }
                    }}
                    title={isActive ? '已綁定為當前計時器任務' : '設為計時器目標'}
                    className={`flex h-8 px-2.5 items-center gap-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-500 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Pin className={`h-3.5 w-3.5 ${isActive ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isActive ? '專注中' : '選定'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => startEditing(task)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    title="編輯任務"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
                    title="刪除任務"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
