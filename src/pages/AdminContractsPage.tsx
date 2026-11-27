import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card } from '../components/ui';
import { Header } from '../components/layout';
import { ClientContractFormModal } from '../components/common/ClientContractFormModal';
import { InstallmentPaymentModal } from '../components/common/InstallmentPaymentModal';
import { clientService, contractService } from '../services';
import { getErrorMessage } from '../utils';
import type {
  Client,
  ClientContract,
  ContractInstallment,
  CreateClientContractInput,
  PaymentMethod,
  UpdateClientContractInput,
} from '../types';
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const localToday = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const statusLabels = {
  active: 'Vigente',
  completed: 'Finalizado',
  cancelled: 'Anulado',
} as const;

const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
};

const getClientName = (contract: ClientContract, clients: Client[]) =>
  contract.client_name ||
  clients.find((client) => client.id === contract.client_id)?.nombre ||
  'Cliente no encontrado';

const isOverdue = (installment: ContractInstallment) =>
  installment.status === 'pending' && installment.due_date.slice(0, 10) < localToday();

export const AdminContractsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<ClientContract | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{
    contractId: string;
    installment: ContractInstallment;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchData = useCallback(() => Promise.all([
    clientService.getAllClientsStrict(),
    contractService.getAllContracts(),
  ]), []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedClients, loadedContracts] = await fetchData();
      setClients(loadedClients);
      setContracts(loadedContracts);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudieron cargar los contratos y pagos.'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    let isCurrent = true;

    fetchData()
      .then(([loadedClients, loadedContracts]) => {
        if (!isCurrent) return;
        setClients(loadedClients);
        setContracts(loadedContracts);
      })
      .catch((err: unknown) => {
        if (isCurrent) {
          setError(getErrorMessage(err, 'No se pudieron cargar los contratos y pagos.'));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchData]);

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-CL');
    return contracts.filter((contract) => {
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      const matchesSearch =
        !query ||
        contract.title.toLocaleLowerCase('es-CL').includes(query) ||
        getClientName(contract, clients).toLocaleLowerCase('es-CL').includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [clients, contracts, search, statusFilter]);

  const activeContracts = contracts.filter((contract) => contract.status === 'active').length;
  const outstandingBalance = contracts
    .filter((contract) => contract.status !== 'cancelled')
    .flatMap((contract) => contract.installments)
    .filter((installment) => installment.status === 'pending')
    .reduce((sum, installment) => sum + installment.amount, 0);
  const overdueInstallments = contracts
    .filter((contract) => contract.status !== 'cancelled')
    .flatMap((contract) => contract.installments)
    .filter(isOverdue).length;

  const handleCreate = async (input: CreateClientContractInput) => {
    await contractService.createContract(input);
    setNotice('Contrato creado correctamente.');
    await loadData();
  };

  const handleUpdate = async (id: string, input: UpdateClientContractInput) => {
    await contractService.updateContract(id, input);
    setNotice('Contrato actualizado correctamente.');
    await loadData();
  };

  const handleRecordPayment = async (payment: {
    paid_at: string;
    payment_method: PaymentMethod;
    payment_reference: string;
  }) => {
    if (!paymentTarget) return;
    await contractService.recordInstallmentPayment(
      paymentTarget.contractId,
      paymentTarget.installment.id,
      payment
    );
    setNotice(`Pago de la cuota ${paymentTarget.installment.number} registrado.`);
    await loadData();
  };

  const openNewContract = () => {
    setNotice(null);
    setEditingContract(null);
    setIsContractModalOpen(true);
  };

  const openEditContract = (contract: ClientContract) => {
    setNotice(null);
    setEditingContract(contract);
    setIsContractModalOpen(true);
  };

  const statusClass = (status: ClientContract['status']) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'completed') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <Header
        title="Contratos y pagos"
        subtitle="Administra contratos de clientes, cuotas y fechas de pago."
        action={
          <Button
            variant="primary"
            onClick={openNewContract}
            disabled={isLoading || Boolean(error) || clients.length === 0}
            className="flex items-center justify-center gap-2"
          >
            <FiPlus size={20} />
            Nuevo contrato
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {notice && (
          <Alert
            type="success"
            title="Actualización exitosa"
            message={notice}
            onClose={() => setNotice(null)}
          />
        )}
        {error && (
          <Alert
            type="error"
            title="No se pudo cargar el módulo"
            message={error}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-gray-500">Contratos vigentes</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{activeContracts}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-500">Saldo pendiente</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(outstandingBalance)}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-500">Cuotas vencidas</p>
            <p className="mt-2 text-2xl font-bold text-red-700">{overdueInstallments}</p>
          </Card>
        </div>

        <Card>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <label htmlFor="contract-search" className="mb-2 block text-sm font-medium text-gray-700">
                Buscar por cliente o contrato
              </label>
              <input
                id="contract-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre del cliente o contrato"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-56">
              <label htmlFor="contract-status-filter" className="mb-2 block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="contract-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Vigentes</option>
                <option value="completed">Finalizados</option>
                <option value="cancelled">Anulados</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Cargando contratos y pagos...</p>
          ) : !error && filteredContracts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium text-gray-700">
                {contracts.length ? 'No hay contratos que coincidan con la búsqueda.' : 'Aún no hay contratos registrados.'}
              </p>
              {!contracts.length && clients.length > 0 && (
                <Button variant="primary" onClick={openNewContract} className="mt-4">
                  Crear primer contrato
                </Button>
              )}
              {!contracts.length && !clients.length && (
                <p className="mt-2 text-sm text-gray-500">Se requiere tener clientes registrados para crear contratos.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente / contrato</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Próxima cuota</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => {
                    const nextInstallment = contract.installments
                      .filter((installment) => installment.status === 'pending')
                      .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
                    const isExpanded = expandedContractId === contract.id;

                    return (
                      <React.Fragment key={contract.id}>
                        <tr className="border-b border-gray-100 align-top">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{getClientName(contract, clients)}</p>
                            <p className="mt-1 text-sm text-gray-600">{contract.title}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Firmado: {formatDate(contract.signed_at)}
                            </p>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {formatCurrency(contract.total_amount)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {nextInstallment ? (
                              <>
                                <span>{formatDate(nextInstallment.due_date)}</span>
                                {isOverdue(nextInstallment) && (
                                  <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                                    Vencida
                                  </span>
                                )}
                              </>
                            ) : 'Sin cuotas pendientes'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(contract.status)}`}>
                              {statusLabels[contract.status]}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditContract(contract)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                                className="flex items-center gap-1"
                              >
                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                Cuotas
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td colSpan={5} className="px-4 py-4">
                              {contract.description && (
                                <p className="mb-4 text-sm text-gray-600">{contract.description}</p>
                              )}
                              {contract.installments.length === 0 ? (
                                <p className="text-sm text-gray-500">Este contrato no tiene cuotas registradas.</p>
                              ) : (
                                <div className="space-y-2">
                                  {contract.installments
                                    .slice()
                                    .sort((a, b) => a.number - b.number)
                                    .map((installment) => {
                                      const overdue = isOverdue(installment);
                                      return (
                                        <div
                                          key={installment.id}
                                          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              Cuota {installment.number} · {formatCurrency(installment.amount)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              Vencimiento: {formatDate(installment.due_date)}
                                              {installment.status === 'paid' && installment.paid_at
                                                ? ` · Pagada el ${formatDate(installment.paid_at)}`
                                                : ''}
                                            </p>
                                            {installment.status === 'paid' && installment.payment_method && (
                                              <p className="text-xs text-gray-500">
                                                {paymentMethodLabels[installment.payment_method]}
                                                {installment.payment_reference
                                                  ? ` · Ref. ${installment.payment_reference}`
                                                  : ''}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span
                                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                installment.status === 'paid'
                                                  ? 'bg-green-100 text-green-800'
                                                  : overdue
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-800'
                                              }`}
                                            >
                                              {installment.status === 'paid' ? 'Pagada' : overdue ? 'Vencida' : 'Pendiente'}
                                            </span>
                                            {installment.status === 'pending' && contract.status !== 'cancelled' && (
                                              <Button
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                onClick={() => setPaymentTarget({ contractId: contract.id, installment })}
                                              >
                                                Registrar pago
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {isContractModalOpen && (
        <ClientContractFormModal
          key={editingContract?.id ?? 'new-contract'}
          clients={clients}
          contract={editingContract}
          isOpen
          onClose={() => setIsContractModalOpen(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
      {paymentTarget && (
        <InstallmentPaymentModal
          key={`${paymentTarget.contractId}-${paymentTarget.installment.id}`}
          installment={paymentTarget.installment}
          isOpen
          onClose={() => setPaymentTarget(null)}
          onSave={handleRecordPayment}
        />
      )}
    </div>
  );
};

AdminContractsPage.displayName = 'AdminContractsPage';
