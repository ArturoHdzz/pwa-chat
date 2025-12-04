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
  group?: {
    id: string;
    name: string;
  };
  my_status?: 'pending' | 'in_progress' | 'submitted'|'approved'|'rejected'| 'completed';
  my_grade?: number;
  
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date: string;
  assignee_ids?: string[]; 
  is_individual?: boolean; 
}