export type UserRole = 'admin' | 'lawyer' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telefono: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  rut: string;
  nombre: string;
  telefono: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  client_id: string;
  tipo: string;
  estado: 'abierto' | 'en_progreso' | 'cerrado' | 'pausado';
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  contenido: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientStats {
  total: number;
  timestamp: string;
}

export interface CaseStats {
  total: number;
  by_status: Record<string, number>;
  timestamp: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  nombre: string;
  nombre_original: string;
  url: string;
  tipo_archivo: string;
  tamaño: number;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  case_id: string;
  created_by_id: string;
  assigned_to_id: string;
  prioridad: TaskPriority;
  estado: TaskStatus;
  fecha_vencimiento: string;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  cambio: string;
  valor_anterior: string;
  valor_nuevo: string;
  changed_by_id: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  timestamp: string;
}
