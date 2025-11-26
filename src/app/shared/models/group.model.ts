export interface Group {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  is_class: boolean;
  created_at?: string;
  updated_at?: string;
  code?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  is_class?: boolean;
}