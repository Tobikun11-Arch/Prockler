'use client';

import {useMemo, useState} from 'react';
import AppShell from '@/components/AppShell';
import {
  localDateToEpoch,
  calcDuration,
  formatDuration,
  formatDate
} from '@/lib/date';
import {createTask, deleteTask, type TaskStatus} from '@/lib/tasks';
import {useAllTasks, useTaskQuery} from '@/hooks/useTasks';

const STATUSES: TaskStatus[] = [
  'In Progress',
  'Completed',
  'For Approval',
  'Pending'
];

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function parseTimeToEpoch(date: Date, timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export default function DashboardPage() {
  const [dateStr, setDateStr] = useState(() => toDateInputValue(new Date()));
  const selectedDate = useMemo(() => new Date(dateStr), [dateStr]);
  const dateEpoch = useMemo(
    () => localDateToEpoch(selectedDate),
    [selectedDate]
  );

  const allTasks = useAllTasks();
  const todayTasks = useTaskQuery({
    startDate: dateEpoch,
    endDate: dateEpoch + 86399999
  });

  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [notes, setNotes] = useState('');

  const taskTitleOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of allTasks) {
      const title = (t.taskTitle ?? '').trim();
      if (!title) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(title);
    }
    return out;
  }, [allTasks]);

  const taskCategoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of allTasks) {
      const cat = (t.taskCategory ?? '').trim();
      if (!cat) continue;
      const key = cat.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(cat);
    }
    return out;
  }, [allTasks]);

  const startEpoch = useMemo(
    () => parseTimeToEpoch(selectedDate, startTimeStr),
    [selectedDate, startTimeStr]
  );
  const endEpoch = useMemo(
    () => parseTimeToEpoch(selectedDate, endTimeStr),
    [selectedDate, endTimeStr]
  );
  const durationMinutes = useMemo(
    () => (startEpoch && endEpoch ? calcDuration(startEpoch, endEpoch) : 0),
    [startEpoch, endEpoch]
  );

  const todayTotal = useMemo(
    () => todayTasks.reduce((s, t) => s + (t.durationMinutes ?? 0), 0),
    [todayTasks]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    createTask({
      entryDate: dateEpoch,
      startTime: startEpoch,
      endTime: endEpoch,
      durationMinutes,
      taskCategory: taskCategory.trim() ? taskCategory.trim() : null,
      taskTitle: taskTitle.trim(),
      notes: notes.trim() ? notes.trim() : null,
      status
    });

    setTaskTitle('');
    setTaskCategory('');
    setStartTimeStr('');
    setEndTimeStr('');
    setStatus('In Progress');
    setNotes('');
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Daily Log
        </div>
        <h1 className="text-4xl md:text-5xl font-black mt-2">Log a Task</h1>
        <div className="text-sm text-muted-foreground mt-2">
          {formatDate(dateEpoch)} · {todayTasks.length} task
          {todayTasks.length !== 1 ? 's' : ''} · {formatDuration(todayTotal)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border border-border bg-card p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Date
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Task title
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="What did you work on?"
                list="taskTitleOptions"
              />
              <datalist id="taskTitleOptions">
                {taskTitleOptions.map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Category
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                value={taskCategory}
                onChange={e => setTaskCategory(e.target.value)}
                placeholder="Optional"
                list="taskCategoryOptions"
              />
              <datalist id="taskCategoryOptions">
                {taskCategoryOptions.map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Start time
                </label>
                <input
                  className="w-full border border-border bg-background px-3 py-2"
                  type="time"
                  value={startTimeStr}
                  onChange={e => setStartTimeStr(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  End time
                </label>
                <input
                  className="w-full border border-border bg-background px-3 py-2"
                  type="time"
                  value={endTimeStr}
                  onChange={e => setEndTimeStr(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Status
              </label>
              <select
                className="w-full border border-border bg-background px-3 py-2"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Notes
              </label>
              <textarea
                className="w-full border border-border bg-background px-3 py-2 min-h-[96px]"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Duration:{' '}
                <span className="text-foreground font-medium">
                  {formatDuration(durationMinutes)}
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.18em] uppercase"
              >
                Add task
              </button>
            </div>
          </form>
        </section>

        <aside className="border border-border bg-card p-5">
          <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Today
          </div>
          <div className="mt-4 space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No tasks logged yet.
              </div>
            ) : (
              todayTasks.map(t => (
                <div
                  key={t.id}
                  className="border border-border bg-background p-3"
                >
                  <div className="text-sm font-medium">
                    {t.taskTitle || 'Untitled'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(t.taskCategory ?? '').trim() ? `#${t.taskCategory}` : ''}{' '}
                    {t.status}
                    {(t.durationMinutes ?? 0) > 0
                      ? ` · ${formatDuration(t.durationMinutes ?? 0)}`
                      : ''}
                  </div>
                  {t.notes ? (
                    <div className="text-xs text-muted-foreground mt-1">
                      {t.notes}
                    </div>
                  ) : null}
                  <div className="mt-2">
                    <button
                      className="text-xs text-destructive underline underline-offset-2"
                      onClick={() => deleteTask(t.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
