import { create } from 'zustand';
import type { User } from '../types';
import { userService } from '../services';

interface UserStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (email: string, password: string, firstName: string, lastName: string, telefono: string, role: string) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getAllUsers();
      set({ users, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  createUser: async (email: string, password: string, firstName: string, lastName: string, telefono: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.createUser(email, password, firstName, lastName, telefono, role);
      set((state) => ({
        users: [...state.users, user],
        isLoading: false,
      }));
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create user',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.updateUser(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? user : u)),
        isLoading: false,
      }));
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update user',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete user',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
