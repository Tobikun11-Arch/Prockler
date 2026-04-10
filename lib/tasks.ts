export type TaskStatus =
  | 'Completed'
  | 'In Progress'
  | 'For Approval'
  | 'Pending';

export type Task = {
  id: number;
  entryDate: number;
  startTime?: number | null;
  endTime?: number | null;
  durationMinutes?: number | null;
  taskCategory?: string | null;
  taskTitle?: string | null;
  notes?: string | null;
  status: TaskStatus;
};

type TaskCreateInput = Omit<Task, 'id'>;

const STORAGE_KEY = 'eod_tasks_v1';
const EMIT_EVENT = 'eod_tasks_changed';

let cachedRaw: string | null = null;
let cachedTasks: Task[] = [];

function isBrowser() {
  return typeof window !== 'undefined';
}

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadTasks(): Task[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed as Task[];
}

export function getTasksSnapshot(): Task[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedTasks;

  const parsed = safeParse(raw);
  cachedRaw = raw;
  cachedTasks = Array.isArray(parsed) ? (parsed as Task[]) : [];
  return cachedTasks;
}

export function saveTasks(tasks: Task[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  cachedRaw = window.localStorage.getItem(STORAGE_KEY);
  cachedTasks = tasks;
  window.dispatchEvent(new Event(EMIT_EVENT));
}

export function subscribeTasks(callback: () => void) {
  if (!isBrowser()) return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  const onCustom = () => callback();

  window.addEventListener('storage', onStorage);
  window.addEventListener(EMIT_EVENT, onCustom);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EMIT_EVENT, onCustom);
  };
}

export function createTask(input: TaskCreateInput): Task {
  const tasks = loadTasks();
  const nextId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const task: Task = {
    id: nextId,
    ...input
  };
  saveTasks([task, ...tasks]);
  return task;
}

export function updateTask(
  id: number,
  patch: Partial<Omit<Task, 'id'>>
): Task | null {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx < 0) return null;
  const updated: Task = {
    ...tasks[idx]!,
    ...patch,
    id
  };
  const next = tasks.slice();
  next[idx] = updated;
  saveTasks(next);
  return updated;
}

export function deleteTask(id: number) {
  const tasks = loadTasks();
  const next = tasks.filter(t => t.id !== id);
  saveTasks(next);
}

export type TaskListQuery = {
  startDate?: number;
  endDate?: number;
  category?: string;
  status?: string;
  keyword?: string;
};

export function queryTasks(query: TaskListQuery): Task[] {
  const tasks = loadTasks();
  const {startDate, endDate, category, status, keyword} = query;

  return tasks.filter(t => {
    if (typeof startDate === 'number' && t.entryDate < startDate) return false;
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
}
