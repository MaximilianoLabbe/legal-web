import { create } from 'zustand';
import { taskService, type CreateTaskInput, type UpdateTaskInput } from '../services/taskService';
import type { Task } from '../types';

interface TaskStore {
  // State
  tasks: Task[];
  myTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Fetch
  fetchTasksByCase: (caseId: string) => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  fetchAllTasks: () => Promise<void>;
  fetchTasksByUser: (userId: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;

  // Actions - Create/Update/Delete
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => Promise<Task>;
  assignTask: (taskId: string, userId: string) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;

  // Actions - UI
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  myTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,

  // Fetch tasks by case
  fetchTasksByCase: async (caseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasksByCase(caseId);
      set({ tasks, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar tareas';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Fetch my assigned tasks
  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const myTasks = await taskService.getMyTasks();
      set({ myTasks, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar mis tareas';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Fetch all tasks (admin only)
  fetchAllTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getAllTasks();
      set({ tasks, myTasks: tasks, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar todas las tareas';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Fetch tasks for a specific user
  fetchTasksByUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasksByUser(userId);
      set({ tasks, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar tareas del usuario';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Fetch single task details
  fetchTaskById: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const selectedTask = await taskService.getTaskById(taskId);
      set({ selectedTask, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar detalle de tarea';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Create new task
  createTask: async (input: CreateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskService.createTask(input);
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
      return newTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear tarea';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId: string, input: UpdateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.updateTask(taskId, input);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        myTasks: state.myTasks.map((t) => (t.id === taskId ? updatedTask : t)),
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar tarea';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Update task status (shortcut)
  updateTaskStatus: async (taskId: string, status) => {
    return get().updateTask(taskId, { estado: status });
  },

  // Assign task to user
  assignTask: async (taskId: string, userId: string) => {
    return get().updateTask(taskId, { assigned_to_id: userId });
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        myTasks: state.myTasks.filter((t) => t.id !== taskId),
        selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar tarea';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // UI Actions
  setSelectedTask: (task) => set({ selectedTask: task }),
  clearError: () => set({ error: null }),
  clearTasks: () => set({ tasks: [], myTasks: [], selectedTask: null }),
}));
