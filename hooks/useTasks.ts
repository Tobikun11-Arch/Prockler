'use client';

import {useMemo, useSyncExternalStore} from 'react';
import {
  getTasksSnapshot,
  subscribeTasks,
  type Task,
  type TaskListQuery
} from '@/lib/tasks';

// Stable fallback for server rendering
const EMPTY_TASKS: Task[] = [];
function getServerSnapshot(): Task[] {
  return EMPTY_TASKS;
}

export function useAllTasks(): Task[] {
  const tasks = useSyncExternalStore(
    subscribeTasks,
    getTasksSnapshot,
    getServerSnapshot
  );
  return tasks;
}

export function useTaskQuery(query: TaskListQuery): Task[] {
  const all = useAllTasks();

  return useMemo(() => {
    const {startDate, endDate, category, status, keyword} = query;

    return all.filter(t => {
      if (typeof startDate === 'number' && t.entryDate < startDate)
        return false;
      if (typeof endDate === 'number' && t.entryDate > endDate) return false;
      if (category && t.taskCategory !== category) return false;
      if (status && t.status !== status) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        const hay = `${t.taskTitle ?? ''} ${t.notes ?? ''}`.toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });
  }, [
    all,
    query.startDate,
    query.endDate,
    query.category,
    query.status,
    query.keyword
  ]);
}
