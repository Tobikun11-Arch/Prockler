'use client';

import {useMemo, useState} from 'react';
import AppShell from '@/components/AppShell';
import {formatDate, formatDuration} from '@/lib/date';
import type {Task, TaskStatus} from '@/features/tasks/types';
import {useAllTasks} from '@/hooks/useTasks';
import {useDeleteTask, useUpdateTask} from '@/features/tasks/taskQueries';

const STATUSES: TaskStatus[] = [
  'In Progress',
  'Completed',
  'For Approval',
  'Pending'
];

type ViewMode = 'month' | 'year';

export default function TasksPage() {
  const all = useAllTasks();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const {startDate, endDate} = useMemo(() => {
    if (viewMode === 'year') {
      return {
        startDate: new Date(year, 0, 1).getTime(),
        endDate: new Date(year, 11, 31, 23, 59, 59).getTime()
      };
    }

    return {
      startDate: new Date(year, month, 1).getTime(),
      endDate: new Date(year, month + 1, 0, 23, 59, 59).getTime()
    };
  }, [viewMode, year, month]);

  const tasks = useMemo(
    () =>
      all.filter(
        (t: Task) => t.entryDate >= startDate && t.entryDate <= endDate
      ),
    [all, startDate, endDate]
  );

  const totalMinutes = useMemo(
    () => tasks.reduce((s: number, t: Task) => s + (t.durationMinutes ?? 0), 0),
    [tasks]
  );

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Overview
        </div>
        <h1 className="text-4xl md:text-5xl font-black mt-2">Task List</h1>
        <div className="text-sm text-muted-foreground mt-2">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} ·{' '}
          {formatDuration(totalMinutes)}
        </div>
      </div>

      <div className="border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-xs tracking-[0.18em] uppercase border border-border ${
                viewMode === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background'
              }`}
              onClick={() => setViewMode('month')}
              type="button"
            >
              Month
            </button>
            <button
              className={`px-3 py-1 text-xs tracking-[0.18em] uppercase border border-border ${
                viewMode === 'year'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background'
              }`}
              onClick={() => setViewMode('year')}
              type="button"
            >
              Year
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 text-xs border border-border"
              onClick={() => {
                if (viewMode === 'year') setYear(y => y - 1);
                else if (month === 0) {
                  setMonth(11);
                  setYear(y => y - 1);
                } else setMonth(m => m - 1);
              }}
            >
              Prev
            </button>
            <div className="text-sm font-medium min-w-[140px] text-center">
              {viewMode === 'year'
                ? `${year}`
                : new Date(year, month, 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
            </div>
            <button
              type="button"
              className="px-3 py-1 text-xs border border-border"
              onClick={() => {
                if (viewMode === 'year') setYear(y => y + 1);
                else if (month === 11) {
                  setMonth(0);
                  setYear(y => y + 1);
                } else setMonth(m => m + 1);
              }}
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-auto">
          <table className="w-full text-sm border border-border bg-background">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Date
                </th>
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Task
                </th>
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Category
                </th>
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Duration
                </th>
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Status
                </th>
                <th className="text-right p-2 text-xs tracking-[0.18em] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    No tasks in this period.
                  </td>
                </tr>
              ) : (
                tasks
                  .slice()
                  .sort((a: Task, b: Task) => b.entryDate - a.entryDate)
                  .map((t: Task) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="p-2 whitespace-nowrap">
                        {formatDate(t.entryDate)}
                      </td>
                      <td className="p-2 min-w-[240px]">
                        <div className="font-medium">
                          {t.taskTitle || 'Untitled'}
                        </div>
                        {t.notes ? (
                          <div className="text-xs text-muted-foreground truncate">
                            {t.notes}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {t.taskCategory ?? ''}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {formatDuration(t.durationMinutes ?? 0)}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <select
                          className="border border-border bg-card px-2 py-1 text-xs"
                          value={t.status}
                          onChange={e =>
                            updateTaskMutation.mutate({
                              id: t.id,
                              patch: {status: e.target.value as TaskStatus}
                            })
                          }
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <button
                          className="text-xs text-destructive underline underline-offset-2"
                          onClick={() => deleteTaskMutation.mutate(t.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
