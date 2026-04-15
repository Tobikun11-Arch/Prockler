import type {ApiResult} from '@/services/http/request';
import {apiRequest} from '@/services/http/request';
import type {Task, TaskCreateInput, TaskListQuery, TaskUpdatePatch} from './types';

export async function listTasks(
  query?: TaskListQuery
): Promise<ApiResult<{tasks: Task[]}>> {
  return apiRequest<{tasks: Task[]}>(
    query
      ? {
          method: 'GET',
          url: '/api/tasks',
          params: query
        }
      : {
          method: 'GET',
          url: '/api/tasks'
        }
  );
}

export async function createTask(
  input: TaskCreateInput
): Promise<ApiResult<{task: Task}>> {
  return apiRequest<{task: Task}>({
    method: 'POST',
    url: '/api/tasks',
    data: input
  });
}

export async function updateTask(
  id: string,
  patch: TaskUpdatePatch
): Promise<ApiResult<{task: Task}>> {
  return apiRequest<{task: Task}>({
    method: 'PATCH',
    url: `/api/tasks/${id}`,
    data: patch
  });
}

export async function deleteTask(id: string): Promise<ApiResult<{ok: true}>> {
  return apiRequest<{ok: true}>({
    method: 'DELETE',
    url: `/api/tasks/${id}`
  });
}
