import api from './api';
import type {
  ApiResponse,
  ClientContract,
  CreateClientContractInput,
  RecordInstallmentPaymentInput,
  UpdateClientContractInput,
} from '../types';

const isApiResponse = <T,>(body: T | ApiResponse<T>): body is ApiResponse<T> =>
  typeof body === 'object' &&
  body !== null &&
  'data' in body &&
  'message' in body &&
  'statusCode' in body;

const unwrapData = <T,>(body: T | ApiResponse<T>): T => {
  return isApiResponse(body) ? body.data : body;
};

export const contractService = {
  getAllContracts: async (): Promise<ClientContract[]> => {
    const response = await api.get<ClientContract[] | ApiResponse<ClientContract[]>>('/admin/contracts');
    const contracts = unwrapData(response.data);

    if (!Array.isArray(contracts)) {
      throw new Error('Respuesta inválida al cargar los contratos');
    }

    return contracts;
  },

  createContract: async (input: CreateClientContractInput): Promise<ClientContract> => {
    const response = await api.post<ClientContract | ApiResponse<ClientContract>>('/admin/contracts', input);
    return unwrapData(response.data);
  },

  updateContract: async (
    id: string,
    input: UpdateClientContractInput
  ): Promise<ClientContract> => {
    const response = await api.patch<ClientContract | ApiResponse<ClientContract>>(`/admin/contracts/${id}`, input);
    return unwrapData(response.data);
  },

  recordInstallmentPayment: async (
    contractId: string,
    installmentId: string,
    input: RecordInstallmentPaymentInput
  ): Promise<ClientContract> => {
    const response = await api.post<ClientContract | ApiResponse<ClientContract>>(
      `/admin/contracts/${contractId}/installments/${installmentId}/payments`,
      input
    );
    return unwrapData(response.data);
  },
};
