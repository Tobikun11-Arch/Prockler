'use client';

import {useMemo, useState} from 'react';
import AppShell from '@/components/AppShell';
import {formatDate, formatDuration, localDateToEpoch} from '@/lib/date';
import type {Task, TaskStatus} from '@/features/tasks/types';
import {useTaskQuery} from '@/hooks/useTasks';
import {useUpdateTask} from '@/features/tasks/taskQueries';

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

export default function DailyPage() {
  const updateTaskMutation = useUpdateTask();

  const [monthStr, setMonthStr] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [selectedDateStr, setSelectedDateStr] = useState(() =>
    toDateInputValue(new Date())
  );
  const selectedDate = useMemo(
    () => new Date(selectedDateStr),
    [selectedDateStr]
  );
  const selectedEpoch = useMemo(
    () => localDateToEpoch(selectedDate),
    [selectedDate]
  );

  const {startDate, endDate} = useMemo(() => {
    const [yStr, mStr] = monthStr.split('-');
    const y = Number(yStr);
    const m = Number(mStr) - 1;
    const start = new Date(y, m, 1).getTime();
    const end = new Date(y, m + 1, 0, 23, 59, 59).getTime();
    return {startDate: start, endDate: end};
  }, [monthStr]);

  const monthTasks = useTaskQuery({startDate, endDate});

  const selectedTasks = useMemo(
    () => monthTasks.filter((t: Task) => t.entryDate === selectedEpoch),
    [monthTasks, selectedEpoch]
  );

  const selectedTotal = useMemo(
    () =>
      selectedTasks.reduce(
        (s: number, t: Task) => s + (t.durationMinutes ?? 0),
        0
      ),
    [selectedTasks]
  );

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Calendar
        </div>
        <h1 className="text-4xl md:text-5xl font-black mt-2">Daily View</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Month
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="month"
                value={monthStr}
                onChange={e => setMonthStr(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Select day
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="date"
                value={selectedDateStr}
                onChange={e => setSelectedDateStr(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {monthTasks.length} task{monthTasks.length !== 1 ? 's' : ''} in
              this month
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 border border-border bg-card p-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {formatDate(selectedEpoch)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {selectedTasks.length} task
                {selectedTasks.length !== 1 ? 's' : ''}
                {selectedTotal > 0
                  ? ` · ${formatDuration(selectedTotal)} total`
                  : ''}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No tasks for this day.
              </div>
            ) : (
              selectedTasks.map((t: Task) => (
                <div
                  key={t.id}
                  className="border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {t.taskTitle || 'Untitled'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(t.taskCategory ?? '').trim()
                          ? `#${t.taskCategory}`
                          : ''}
                        {t.durationMinutes
                          ? ` · ${formatDuration(t.durationMinutes)}`
                          : ''}
                      </div>
                      {t.notes ? (
                        <div className="text-xs text-muted-foreground mt-2">
                          {t.notes}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0">
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
