import { create } from 'zustand';
import type { Case } from '../types';
import { caseService } from '../services';

interface CaseStore {
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  error: string | null;
  fetchCases: (user_id?: string) => Promise<Case[]>;
  getCaseById: (id: string) => Promise<Case>;
  getCasesByClient: (client_id: string) => Promise<Case[]>;
  getCasesByUser: (user_id: string) => Promise<Case[]>;
  createCase: (
    user_id: string,
    client_id: string,
    tipo: string,
    estado: string,
    descripcion: string,
    fecha_inicio: string,
    fecha_fin: string
  ) => Promise<Case>;
  updateCase: (id: string, data: Partial<Case>) => Promise<Case>;
  deleteCase: (id: string) => Promise<void>;
  setSelectedCase: (caseData: Case | null) => void;
  clearError: () => void;
}

export const useCaseStore = create<CaseStore>((set) => ({
  cases: [],
  selectedCase: null,
  isLoading: false,
  error: null,

  fetchCases: async (user_id?: string) => {
    set({ isLoading: true, error: null });
    try {
      const cases = user_id 
        ? await caseService.getCasesByUser(user_id)
        : await caseService.getAllCases();
      set({ cases, isLoading: false });
      return cases;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch cases',
        isLoading: false,
      });
      throw error;
    }
  },

  getCaseById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const caseData = await caseService.getCaseById(id);
      set({ selectedCase: caseData, isLoading: false });
      return caseData;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch case',
        isLoading: false,
      });
      throw error;
    }
  },

  getCasesByClient: async (client_id: string) => {
    set({ isLoading: true, error: null });
    try {
      const cases = await caseService.getCasesByClient(client_id);
      set({ cases, isLoading: false });
      return cases;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch cases',
        isLoading: false,
      });
      throw error;
    }
  },

  getCasesByUser: async (user_id: string) => {
    set({ isLoading: true, error: null });
    try {
      const cases = await caseService.getCasesByUser(user_id);
      set({ cases, isLoading: false });
      return cases;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch cases',
        isLoading: false,
      });
      throw error;
    }
  },

  createCase: async (
    user_id: string,
    client_id: string,
    tipo: string,
    estado: string,
    descripcion: string,
    fecha_inicio: string,
    fecha_fin: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const caseData = await caseService.createCase(
        user_id,
        client_id,
        tipo,
        estado,
        descripcion,
        fecha_inicio,
        fecha_fin
      );
      set((state) => ({
        cases: [...state.cases, caseData],
        isLoading: false,
      }));
      return caseData;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create case',
        isLoading: false,
      });
      throw error;
    }
  },

  updateCase: async (id: string, data: Partial<Case>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCase = await caseService.updateCase(id, data);
      set((state) => ({
        cases: state.cases.map((c) => (c.id === id ? updatedCase : c)),
        selectedCase: state.selectedCase?.id === id ? updatedCase : state.selectedCase,
        isLoading: false,
      }));
      return updatedCase;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update case',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCase: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await caseService.deleteCase(id);
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== id),
        selectedCase: state.selectedCase?.id === id ? null : state.selectedCase,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete case',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedCase: (caseData: Case | null) => {
    set({ selectedCase: caseData });
  },

  clearError: () => {
    set({ error: null });
  },
}));
