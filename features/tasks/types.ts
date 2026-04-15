export type TaskStatus =
  | 'Completed'
  | 'In Progress'
  | 'For Approval'
  | 'Pending';

export type Task = {
  id: string;
  userId: string;
  entryDate: number;
  startTime?: number | null;
  endTime?: number | null;
  durationMinutes?: number | null;
  taskCategory?: string | null;
  taskTitle?: string | null;
  notes?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskCreateInput = {
  entryDate: number;
  startTime?: number | null;
  endTime?: number | null;
  durationMinutes?: number | null;
  taskCategory?: string | null;
  taskTitle: string;
  notes?: string | null;
  status: TaskStatus;
};

export type TaskUpdatePatch = Partial<Omit<TaskCreateInput, 'entryDate'>> & {
  entryDate?: number;
};

export type TaskListQuery = {
  startDate?: number;
  endDate?: number;
  category?: string;
  status?: string;
  keyword?: string;
};
