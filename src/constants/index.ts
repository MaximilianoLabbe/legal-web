export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  CLIENTS_CREATE: '/clients/create',
  CLIENTS_EDIT: '/clients/:id/edit',
  CLIENTS_DETAIL: '/clients/:id',
  CASES: '/cases',
  CASES_CREATE: '/cases/create',
  CASES_EDIT: '/cases/:id/edit',
  CASES_DETAIL: '/cases/:id',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_USERS_EDIT: '/admin/users/:id/edit',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  USER: 'user',
};

export const CASE_STATES = {
  OPEN: 'abierto',
  IN_PROGRESS: 'en_progreso',
  CLOSED: 'cerrado',
  PAUSED: 'pausado',
};

export const CASE_STATE_LABELS: Record<string, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  cerrado: 'Cerrado',
  pausado: 'Pausado',
};

export const CASE_STATE_COLORS: Record<string, string> = {
  abierto: 'bg-blue-100 text-blue-800',
  en_progreso: 'bg-yellow-100 text-yellow-800',
  cerrado: 'bg-green-100 text-green-800',
  pausado: 'bg-red-100 text-red-800',
};

export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'auth_user';
