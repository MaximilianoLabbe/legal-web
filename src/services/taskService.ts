import api from './api';
import type { Task, TaskHistory, TaskStats, TaskPriority, TaskStatus } from '../types';

export interface CreateTaskInput {
  titulo: string;
  descripcion: string;
  case_id: string;
  prioridad: TaskPriority;
  assigned_to_id: string;
  fecha_vencimiento: string;
}

export interface UpdateTaskInput {
  titulo?: string;
  descripcion?: string;
  prioridad?: TaskPriority;
  assigned_to_id?: string;
  estado?: TaskStatus;
  fecha_vencimiento?: string;
}

// Demo data for testing without backend
const DEMO_TASKS: Task[] = [
  {
    id: '1',
    case_id: '1',
    titulo: 'Revisar documentos iniciales',
    descripcion: 'Revisar y validar los documentos enviados por el cliente',
    assigned_to_id: 'demo-user-1',
    created_by_id: 'demo-user-1',
    prioridad: 'high',
    estado: 'in_progress',
    fecha_vencimiento: new Date(2026, 4, 8).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    case_id: '1',
    titulo: 'Preparar escritos legales',
    descripcion: 'Elaborar demanda y documentos asociados para presentación',
    assigned_to_id: 'demo-user-1',
    created_by_id: 'demo-user-1',
    prioridad: 'high',
    estado: 'pending',
    fecha_vencimiento: new Date(2026, 4, 10).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    case_id: '2',
    titulo: 'Contactar con contraparte',
    descripcion: 'Establecer comunicación con la otra parte para negociación',
    assigned_to_id: 'demo-user-1',
    created_by_id: 'demo-user-1',
    prioridad: 'medium',
    estado: 'pending',
    fecha_vencimiento: new Date(2026, 4, 15).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    case_id: '3',
    titulo: 'Investigación de antecedentes',
    descripcion: 'Investigar antecedentes e historial de la otra parte',
    assigned_to_id: 'demo-user-1',
    created_by_id: 'demo-user-1',
    prioridad: 'medium',
    estado: 'completed',
    fecha_vencimiento: new Date(2026, 4, 20).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    case_id: '1',
    titulo: 'Presentar ante el tribunal',
    descripcion: 'Presentar documentos y demanda ante el juzgado correspondiente',
    assigned_to_id: 'demo-user-1',
    created_by_id: 'demo-user-1',
    prioridad: 'high',
    estado: 'pending',
    fecha_vencimiento: new Date(2026, 5, 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Service for managing tasks (tareas) across cases
 * Handles creation, reading, updating, deletion and task assignments
 */
export const taskService = {
  /**
   * Create a new task in a case
   * POST /api/tareas
   */
  createTask: async (input: CreateTaskInput): Promise<Task> => {
    try {
      const response = await api.post('/tareas', input);
      return response.data.data || response.data;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return {
          id: 'demo-task-' + Date.now(),
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Task;
      }
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Get all tasks for a specific case
   * GET /api/tareas/caso/{caseId}
   */
  getTasksByCase: async (caseId: string): Promise<Task[]> => {
    try {
      const response = await api.get(`/tareas/caso/${caseId}`);
      const data = response.data.data || response.data;
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      // If no tasks found, use demo data for this case
      return tasks.length > 0 ? tasks : DEMO_TASKS.filter(t => t.case_id === caseId);
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error(`Error fetching tasks for case ${caseId}, using demo data:`, error.message);
      return DEMO_TASKS.filter(t => t.case_id === caseId);
    }
  },

  /**
   * Get my assigned tasks (authenticated user)
   * GET /api/tareas/mis-tareas
   */
  getMyTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tareas/mis-tareas');
      const data = response.data.data || response.data;
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      // If no tasks found, use demo data
      return tasks.length > 0 ? tasks : DEMO_TASKS;
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error('Error fetching my tasks, using demo data:', error.message);
      return DEMO_TASKS;
    }
  },

  /**
   * Get all tasks (admin only)
   * GET /api/tareas
   */
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tareas');
      const data = response.data.data || response.data;
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      // If no tasks found, use demo data
      return tasks.length > 0 ? tasks : DEMO_TASKS;
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error('Error fetching all tasks, using demo data:', error.message);
      return DEMO_TASKS;
    }
  },

  /**
   * Get all tasks assigned to a specific user
   * GET /api/tareas/usuario/{userId}
   */
  getTasksByUser: async (userId: string): Promise<Task[]> => {
    try {
      const response = await api.get(`/tareas/usuario/${userId}`);
      const data = response.data.data || response.data;
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      // If no tasks found, use demo data for this user
      return tasks.length > 0 ? tasks : DEMO_TASKS.filter(t => t.assigned_to_id === userId);
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error(`Error fetching tasks for user ${userId}, using demo data:`, error.message);
      return DEMO_TASKS.filter(t => t.assigned_to_id === userId);
    }
  },

  /**
   * Get task statistics for a case
   * GET /api/tareas/caso/{caseId}/estadísticas
   */
  getTaskStats: async (caseId: string): Promise<TaskStats> => {
    try {
      const response = await api.get(`/tareas/caso/${caseId}/estadísticas`);
      return response.data.data || response.data;
    } catch (error: any) {
      // Fallback to demo mode - calculate from demo tasks
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        const caseTasks = DEMO_TASKS.filter(t => t.case_id === caseId);
        return {
          total: caseTasks.length,
          by_status: {
            pending: caseTasks.filter(t => t.estado === 'pending').length,
            in_progress: caseTasks.filter(t => t.estado === 'in_progress').length,
            completed: caseTasks.filter(t => t.estado === 'completed').length,
            cancelled: caseTasks.filter(t => t.estado === 'cancelled').length,
          },
          by_priority: {
            low: caseTasks.filter(t => t.prioridad === 'low').length,
            medium: caseTasks.filter(t => t.prioridad === 'medium').length,
            high: caseTasks.filter(t => t.prioridad === 'high').length,
          },
          timestamp: new Date().toISOString(),
        };
      }
      console.error(`Error fetching task stats for case ${caseId}:`, error);
      throw error;
    }
  },

  /**
   * Get task details
   * GET /api/tareas/{taskId}
   */
  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      const response = await api.get(`/tareas/${taskId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      // Fallback to demo data
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return DEMO_TASKS.find(t => t.id === taskId) || DEMO_TASKS[0];
      }
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Update a task
   * PUT /api/tareas/{taskId}
   */
  updateTask: async (taskId: string, input: UpdateTaskInput): Promise<Task> => {
    try {
      const response = await api.put(`/tareas/${taskId}`, input);
      return response.data.data || response.data;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        const existingTask = DEMO_TASKS.find(t => t.id === taskId);
        if (existingTask) {
          return {
            ...existingTask,
            ...input,
            updated_at: new Date().toISOString(),
          };
        }
      }
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Change task status
   * Shortcut for updateTask with just estado field
   */
  updateTaskStatus: async (taskId: string, estado: TaskStatus): Promise<Task> => {
    return taskService.updateTask(taskId, { estado });
  },

  /**
   * Assign task to a user
   * Shortcut for updateTask with just assigned_to_id field
   */
  assignTask: async (taskId: string, userId: string): Promise<Task> => {
    return taskService.updateTask(taskId, { assigned_to_id: userId });
  },

  /**
   * Delete a task
   * DELETE /api/tareas/{taskId}
   */
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`/tareas/${taskId}`);
    } catch (error: any) {
      // Fallback to demo mode - just resolve without error
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return;
      }
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Get task history/changelog
   * GET /api/tareas/{taskId}/historial
   */
  getTaskHistory: async (taskId: string): Promise<TaskHistory[]> => {
    try {
      const response = await api.get(`/tareas/${taskId}/historial`);
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : data.history || [];
    } catch (error: any) {
      // Fallback to demo mode - return empty history
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return [];
      }
      console.error(`Error fetching history for task ${taskId}:`, error);
      throw error;
    }
  },
};
