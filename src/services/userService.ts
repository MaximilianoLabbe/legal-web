import api from './api';
import type { User } from '../types';

export const userService = {
  createUser: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    telefono: string,
    role: string
  ): Promise<User> => {
    const response = await api.post<any>('/users', {
      email,
      password,
      firstName,
      lastName,
      telefono,
      role,
    });
    // Handle wrapped response from backend
    const userData = response.data.data || response.data;
    return userData;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<any>('/users');
    // Backend returns wrapped response: { data: [...users], message, statusCode }
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get<User>(`/users/email/${email}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
