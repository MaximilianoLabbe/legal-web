import api from './api';
import type { Case, CaseNote } from '../types';

// Demo data for testing without backend
const DEMO_CASES: Case[] = [
  {
    id: '1',
    client_id: '1',
    tipo: 'Civil',
    estado: 'en_progreso',
    descripcion: 'Demanda por incumplimiento de contrato',
    fecha_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: null,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    client_id: '2',
    tipo: 'Laboral',
    estado: 'abierto',
    descripcion: 'Reclamo por despido injustificado',
    fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    client_id: '3',
    tipo: 'Familia',
    estado: 'cerrado',
    descripcion: 'Tramitación de divorcio',
    fecha_inicio: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    client_id: '4',
    tipo: 'Penal',
    estado: 'en_progreso',
    descripcion: 'Defensa por acusación de fraude',
    fecha_inicio: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: null,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    client_id: '5',
    tipo: 'Mercantil',
    estado: 'abierto',
    descripcion: 'Constitución de sociedad anónima',
    fecha_inicio: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: null,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const caseService = {
  createCase: async (
    user_id: string,
    client_id: string,
    tipo: string,
    estado: string,
    descripcion: string,
    fecha_inicio: string,
    fecha_fin: string
  ): Promise<Case> => {
    try {
      const response = await api.post<any>('/cases', {
        user_id,
        client_id,
        tipo,
        estado,
        descripcion,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
      });
      // Handle wrapped response from backend
      const caseData = response.data.data || response.data;
      return caseData;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return {
          id: 'demo-' + Date.now(),
          client_id,
          tipo,
          estado: estado as 'abierto' | 'en_progreso' | 'cerrado' | 'pausado',
          descripcion,
          fecha_inicio,
          fecha_fin: fecha_fin || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  getAllCases: async (): Promise<Case[]> => {
    try {
      const response = await api.get<any>('/cases');
      // Handle wrapped response from backend
      const cases = Array.isArray(response.data) ? response.data : response.data.data || [];
      // If no cases found, use demo data
      return cases.length > 0 ? cases : DEMO_CASES;
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error('Error fetching all cases, using demo data:', error.message);
      return DEMO_CASES;
    }
  },

  getCaseById: async (id: string): Promise<Case> => {
    try {
      const response = await api.get<any>(`/cases/${id}`);
      // Handle wrapped response from backend
      const caseData = response.data.data || response.data;
      return caseData;
    } catch (error: any) {
      // Fallback to demo data
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return DEMO_CASES.find(c => c.id === id) || DEMO_CASES[0];
      }
      throw error;
    }
  },

  getCasesByClient: async (client_id: string): Promise<Case[]> => {
    try {
      const response = await api.get<any>(`/cases/client/${client_id}`);
      // Handle wrapped response from backend
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error: any) {
      // Fallback to demo data
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return DEMO_CASES.filter(c => c.client_id === client_id);
      }
      throw error;
    }
  },

  getCasesByUser: async (user_id: string): Promise<Case[]> => {
    try {
      const response = await api.get<any>(`/cases/user/${user_id}`);
      // Handle wrapped response from backend
      const cases = Array.isArray(response.data) ? response.data : response.data.data || [];
      // If no cases found, use demo data
      return cases.length > 0 ? cases : DEMO_CASES.slice(0, 2);
    } catch (error: any) {
      // Fallback to demo data on any error
      console.error(`Error fetching cases for user ${user_id}, using demo data:`, error.message);
      return DEMO_CASES.slice(0, 2);
    }
  },

  updateCase: async (id: string, data: Partial<Case>): Promise<Case> => {
    try {
      const response = await api.put<any>(`/cases/${id}`, data);
      // Handle wrapped response from backend
      const caseData = response.data.data || response.data;
      return caseData;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return {
          ...(DEMO_CASES.find(c => c.id === id) || DEMO_CASES[0]),
          ...data,
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  deleteCase: async (id: string): Promise<{ message: string; id: string }> => {
    try {
      const response = await api.delete<any>(`/cases/${id}`);
      // Handle wrapped response from backend
      return response.data.data || response.data;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return { message: 'Caso eliminado', id };
      }
      throw error;
    }
  },

  addNote: async (case_id: string, contenido: string): Promise<CaseNote> => {
    try {
      const response = await api.post<any>(`/cases/${case_id}/notes`, {
        contenido,
      });
      // Handle wrapped response from backend
      const noteData = response.data.data || response.data;
      return noteData;
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return {
          id: 'demo-' + Date.now(),
          case_id,
          contenido,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  getCaseNotes: async (case_id: string): Promise<CaseNote[]> => {
    try {
      const response = await api.get<any>(`/cases/${case_id}/notes`);
      // Handle wrapped response from backend
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error: any) {
      // Fallback to demo mode
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },

  deleteNote: async (case_id: string, note_id: string): Promise<void> => {
    try {
      await api.delete(`/cases/${case_id}/notes/${note_id}`);
    } catch (error: any) {
      // Fallback to demo mode - do nothing
      if (error.code === 'ECONNREFUSED' || error.response?.status === 401) {
        return;
      }
      throw error;
    }
  },
};
