export interface User {
  id?: number;
  name: string;
  email: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  activo?: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  activo?: boolean;
}

export interface CreateUserResponse {
  message: string;
  user: User;
  token: string;
}

export interface UpdateUserResponse {
  message?: string;
  user?: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface UserFormData {
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  password?: string;
  confirmPassword?: string;
  activo: boolean;
}