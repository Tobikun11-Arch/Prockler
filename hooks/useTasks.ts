'use client';

import type {TaskListQuery} from '@/features/tasks/types';
import {useTasks} from '@/features/tasks/taskQueries';

export function useAllTasks() {
  return useTasks().data ?? [];
}

export function useTaskQuery(query: TaskListQuery) {
  return useTasks(query).data ?? [];
}
