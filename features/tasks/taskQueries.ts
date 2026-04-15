'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions
} from '@tanstack/react-query';

import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  listTasks as listTasksApi,
  updateTask as updateTaskApi
} from './taskApi';
import type {Task, TaskCreateInput, TaskListQuery, TaskUpdatePatch} from './types';

const taskKeys = {
  all: ['tasks'] as const,
  list: (query?: TaskListQuery) => ['tasks', 'list', query ?? null] as const
};

export function useTasks(query?: TaskListQuery) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: async () => {
      const res = await listTasksApi(query);
      if (!res.ok) throw new Error(res.errorMessage);
      return res.data.tasks;
    }
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskCreateInput) => {
      const res = await createTaskApi(input);
      if (!res.ok) throw new Error(res.errorMessage);
      return res.data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: taskKeys.all});
    }
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {id: string; patch: TaskUpdatePatch}) => {
      const res = await updateTaskApi(input.id, input.patch);
      if (!res.ok) throw new Error(res.errorMessage);
      return res.data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: taskKeys.all});
    }
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteTaskApi(id);
      if (!res.ok) throw new Error(res.errorMessage);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: taskKeys.all});
    }
  });
}

export type {Task};
export {taskKeys};
