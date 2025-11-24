export interface Task {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description?: string;
  due_at: string;
  status: 'pending' | 'completed';
  assignees_count?: number;
  created_at?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date: string;
}