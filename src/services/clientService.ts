import api from './api';
import type { Client, ClientStats } from '../types';

// Demo data for testing without backend
const DEMO_CLIENTS: Client[] = [
  {
    id: '1',
    user_id: 'demo-user-1',
    rut: '12.345.678-9',
    nombre: 'Juan Pérez García',
    telefono: '+56912345678',
    email: 'juan.perez@example.com',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-1',
    rut: '23.456.789-0',
    nombre: 'María García López',
    telefono: '+56987654321',
    email: 'maria.garcia@example.com',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-2',
    rut: '34.567.890-1',
    nombre: 'Carlos López Rodríguez',
    telefono: '+56911223344',
    email: 'carlos.lopez@example.com',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user-1',
    rut: '45.678.901-2',
    nombre: 'Ana Martínez González',
    telefono: '+56955443322',
    email: 'ana.martinez@example.com',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'demo-user-2',
    rut: '56.789.012-3',
    nombre: 'Roberto Fernández Silva',
    telefono: '+56966778899',
    email: 'roberto.fernandez@example.com',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const clientService = {
  createClient: async (
    user_id: string,
    rut: string,
    nombre: string,
    telefono: string,
    email: string
  ): Promise<Client> => {
    try {
      const response = await api.post<any>('/clients', {
        user_id,
        rut,
        nombre,
        telefono,
        email,
      });
      // Handle wrapped response from backend
      const clientData = response.data.data || response.data;
      return clientData;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return {
          id: 'demo-' + Date.now(),
          user_id,
          rut,
          nombre,
          telefono,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get<any>('/clients');
      // Handle wrapped response from backend
      const clients = Array.isArray(response.data) ? response.data : response.data.data || [];
      // If no clients found, use demo data
      return clients.length > 0 ? clients : DEMO_CLIENTS;
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error('Error fetching clients, using demo data:', error.message);
      return DEMO_CLIENTS;
    }
  },

  getClientById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get<any>(`/clients/${id}`);
      // Handle wrapped response from backend
      const clientData = response.data.data || response.data;
      return clientData;
    } catch (error: any) {
      // Fallback to demo data
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return DEMO_CLIENTS.find(c => c.id === id) || DEMO_CLIENTS[0];
      }
      throw error;
    }
  },

  searchClientByRut: async (rut: string): Promise<Client> => {
    try {
      const response = await api.get<any>('/clients/search/rut', {
        params: { rut },
      });
      // Handle wrapped response from backend
      const clientData = response.data.data || response.data;
      return clientData;
    } catch (error: any) {
      throw error;
    }
  },

  updateClient: async (
    id: string,
    data: Partial<Client>
  ): Promise<Client> => {
    try {
      const response = await api.put<any>(`/clients/${id}`, data);
      // Handle wrapped response from backend
      const clientData = response.data.data || response.data;
      return clientData;
    } catch (error: any) {
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<{ message: string; id: string }> => {
    try {
      const response = await api.delete<any>(`/clients/${id}`);
      // Handle wrapped response from backend
      return response.data.data || response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getClientStats: async (): Promise<ClientStats> => {
    try {
      const response = await api.get<any>('/clients/stats/count');
      // Handle wrapped response from backend
      const statsData = response.data.data || response.data;
      return statsData;
    } catch (error: any) {
      throw error;
    }
  },
};
