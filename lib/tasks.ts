export type {Task, TaskListQuery, TaskStatus} from '@/features/tasks/types';

export function createTask() {
  throw new Error('Local tasks are disabled. Use Supabase task mutations.');
}

export function updateTask() {
  throw new Error('Local tasks are disabled. Use Supabase task mutations.');
}

export function deleteTask() {
  throw new Error('Local tasks are disabled. Use Supabase task mutations.');
}

export function queryTasks() {
  throw new Error('Local tasks are disabled. Use Supabase listTasks query.');
}
