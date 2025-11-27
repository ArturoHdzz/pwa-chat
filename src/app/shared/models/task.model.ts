export interface Task {
  id: string;
  group_id: string;
  organization_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  is_individual: boolean; 
  due_at: string;
  created_at: string;
  updated_at?: string;
  assignees_count?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date: string;
  assignee_ids?: string[]; 
  is_individual?: boolean; 
}