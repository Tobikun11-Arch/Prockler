'use client';

import {useMemo, useState} from 'react';
import AppShell from '@/components/AppShell';
import {formatDate, formatDuration} from '@/lib/date';
import type {TaskListQuery, TaskStatus} from '@/features/tasks/types';
import {useTasks, useUpdateTask} from '@/features/tasks/taskQueries';
import type {Task} from '@/features/tasks/types';

const STATUSES: TaskStatus[] = [
  'In Progress',
  'Completed',
  'For Approval',
  'Pending'
];

export default function SearchPage() {
  const updateTaskMutation = useUpdateTask();

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const query: TaskListQuery | undefined = useMemo(() => {
    if (!hasSearched) return undefined;
    return {
      keyword: keyword.trim() || undefined,
      category: category.trim() || undefined,
      status: status.trim() || undefined,
      startDate: startDateStr ? new Date(startDateStr).getTime() : undefined,
      endDate: endDateStr
        ? new Date(endDateStr + 'T23:59:59').getTime()
        : undefined
    };
  }, [hasSearched, keyword, category, status, startDateStr, endDateStr]);

  const tasksQuery = useTasks(query ?? undefined);
  const results = hasSearched ? (tasksQuery.data ?? []) : [];
  const totalMinutes = useMemo(
    () =>
      results.reduce((s: number, t: Task) => s + (t.durationMinutes ?? 0), 0),
    [results]
  );

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasSearched(true);
  }

  function clear() {
    setKeyword('');
    setCategory('');
    setStatus('');
    setStartDateStr('');
    setEndDateStr('');
    setHasSearched(false);
  }

  function exportCSV() {
    if (!results.length) return;

    const headers = [
      'Date',
      'Task Title',
      'Category',
      'Duration (min)',
      'Status',
      'Notes'
    ];

    const rows = results.map((t: Task) => [
      formatDate(t.entryDate),
      t.taskTitle ?? '',
      t.taskCategory ?? '',
      t.durationMinutes ?? 0,
      t.status,
      t.notes ?? ''
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row
          .map(
            (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eod-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Search & Export
        </div>
        <h1 className="text-4xl md:text-5xl font-black mt-2">Find Tasks</h1>
      </div>

      <div className="border border-border bg-card p-5">
        <form onSubmit={onSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">
                Keyword
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Search task title or notes"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Category
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Exact match"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Status
              </label>
              <select
                className="w-full border border-border bg-background px-3 py-2"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Start date
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="date"
                value={startDateStr}
                onChange={e => setStartDateStr(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                End date
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="date"
                value={endDateStr}
                onChange={e => setEndDateStr(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.18em] uppercase"
            >
              Search
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-border text-xs tracking-[0.18em] uppercase"
              onClick={clear}
            >
              Clear
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-border text-xs tracking-[0.18em] uppercase"
              onClick={exportCSV}
              disabled={!results.length}
            >
              Export CSV
            </button>

            {hasSearched ? (
              <div className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
                {results.length ? ` · ${formatDuration(totalMinutes)}` : ''}
              </div>
            ) : null}
          </div>
        </form>

        <div className="mt-6 overflow-auto">
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
                <th className="text-left p-2 text-xs tracking-[0.18em] uppercase">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    Run a search to see results.
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    No results.
                  </td>
                </tr>
              ) : (
                results
                  .slice()
                  .sort((a: Task, b: Task) => b.entryDate - a.entryDate)
                  .map((t: Task) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="p-2 whitespace-nowrap">
                        {formatDate(t.entryDate)}
                      </td>
                      <td className="p-2 min-w-[220px] font-medium">
                        {t.taskTitle ?? 'Untitled'}
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
                      <td className="p-2 min-w-[240px]">{t.notes ?? ''}</td>
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
