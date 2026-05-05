import { create } from 'zustand';
import type { Client } from '../types';
import { clientService } from '../services';
import { useAuthStore } from './authStore';

interface ClientStore {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  getClientById: (id: string) => Promise<Client>;
  createClient: (rut: string, nombre: string, telefono: string, email: string) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  clearError: () => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const clients = await clientService.getAllClients();
      const user = useAuthStore.getState().user;
      
      // Filter clients based on user role
      let filteredClients = clients;
      if (user?.role === 'lawyer') {
        // Lawyers can only see their own clients
        filteredClients = clients.filter((client) => client.user_id === user.id);
      }
      // Admins can see all clients (no filtering)
      
      set({ clients: filteredClients, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch clients',
        isLoading: false,
      });
    }
  },

  getClientById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const client = await clientService.getClientById(id);
      set({ selectedClient: client, isLoading: false });
      return client;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch client',
        isLoading: false,
      });
      throw error;
    }
  },

  createClient: async (rut: string, nombre: string, telefono: string, email: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const client = await clientService.createClient(user.id, rut, nombre, telefono, email);
      set((state) => ({
        clients: [...state.clients, client],
        isLoading: false,
      }));
      return client;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create client',
        isLoading: false,
      });
      throw error;
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedClient = await clientService.updateClient(id, data);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
        selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        isLoading: false,
      }));
      return updatedClient;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update client',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await clientService.deleteClient(id);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete client',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedClient: (client: Client | null) => {
    set({ selectedClient: client });
  },

  clearError: () => {
    set({ error: null });
  },
}));
