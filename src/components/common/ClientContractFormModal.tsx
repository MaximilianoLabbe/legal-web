import React, { useState } from 'react';
import { Alert, Button, Card, Input } from '../ui';
import { getErrorMessage } from '../../utils';
import type {
  Client,
  ClientContract,
  ClientContractStatus,
  CreateClientContractInput,
  UpdateClientContractInput,
} from '../../types';

interface InstallmentDraft {
  amount: string;
  dueDate: string;
}

interface ClientContractFormModalProps {
  clients: Client[];
  contract: ClientContract | null;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateClientContractInput) => Promise<void>;
  onUpdate: (id: string, input: UpdateClientContractInput) => Promise<void>;
}

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const emptyInstallment = (): InstallmentDraft => ({ amount: '', dueDate: '' });

export const ClientContractFormModal: React.FC<ClientContractFormModalProps> = ({
  clients,
  contract,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
}) => {
  const [clientId, setClientId] = useState(contract?.client_id ?? '');
  const [title, setTitle] = useState(contract?.title ?? '');
  const [description, setDescription] = useState(contract?.description ?? '');
  const [signedAt, setSignedAt] = useState(contract?.signed_at?.slice(0, 10) ?? today());
  const [totalAmount, setTotalAmount] = useState(contract ? String(contract.total_amount) : '');
  const [status, setStatus] = useState<ClientContractStatus>(contract?.status ?? 'active');
  const [installments, setInstallments] = useState<InstallmentDraft[]>(
    contract?.installments.map((installment) => ({
      amount: String(installment.amount),
      dueDate: installment.due_date.slice(0, 10),
    })) ?? [emptyInstallment()]
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateInstallment = (index: number, patch: Partial<InstallmentDraft>) => {
    setInstallments((current) =>
      current.map((installment, itemIndex) =>
        itemIndex === index ? { ...installment, ...patch } : installment
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El nombre del contrato es obligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      if (contract) {
        await onUpdate(contract.id, {
          title: title.trim(),
          description: description.trim(),
          status,
        });
      } else {
        const total = Number(totalAmount);
        const validInstallments = installments.map((installment) => ({
          amount: Number(installment.amount),
          due_date: installment.dueDate,
        }));

        if (!clientId) {
          setError('Selecciona un cliente.');
          return;
        }
        if (!signedAt) {
          setError('Ingresa la fecha del contrato.');
          return;
        }
        if (!Number.isSafeInteger(total) || total <= 0) {
          setError('El monto total debe ser un número entero mayor que cero.');
          return;
        }
        if (
          validInstallments.some(
            (installment) =>
              !Number.isSafeInteger(installment.amount) ||
              installment.amount <= 0 ||
              !installment.due_date
          )
        ) {
          setError('Cada cuota debe tener un monto entero y una fecha de vencimiento.');
          return;
        }
        if (validInstallments.reduce((sum, installment) => sum + installment.amount, 0) !== total) {
          setError('La suma de las cuotas debe ser igual al monto total del contrato.');
          return;
        }

        await onCreate({
          client_id: clientId,
          title: title.trim(),
          description: description.trim(),
          signed_at: signedAt,
          total_amount: total,
          currency: 'CLP',
          installments: validInstallments.map((installment, index) => ({
            ...installment,
            number: index + 1,
          })),
        });
      }

      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo guardar el contrato.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="mb-6 flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {contract ? 'Editar contrato' : 'Nuevo contrato'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {contract
                  ? 'Actualiza los datos generales y el estado del contrato.'
                  : 'Asocia un contrato a un cliente y define sus cuotas.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Cerrar"
              className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error" title="No se pudo guardar" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!contract && (
              <>
                <div>
                  <label htmlFor="contract-client" className="mb-2 block text-sm font-medium text-gray-700">
                    Cliente
                  </label>
                  <select
                    id="contract-client"
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nombre} · {client.rut}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Fecha del contrato"
                    type="date"
                    value={signedAt}
                    onChange={(event) => setSignedAt(event.target.value)}
                    disabled={isSaving}
                    required
                  />
                  <Input
                    label="Monto total (CLP)"
                    type="number"
                    min="1"
                    step="1"
                    value={totalAmount}
                    onChange={(event) => setTotalAmount(event.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </>
            )}

            <Input
              label="Nombre del contrato"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Asesoría legal anual"
              disabled={isSaving}
              required
            />

            <div>
              <label htmlFor="contract-description" className="mb-2 block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="contract-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                disabled={isSaving}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {contract ? (
              <div>
                <label htmlFor="contract-status" className="mb-2 block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="contract-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ClientContractStatus)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Vigente</option>
                  <option value="completed">Finalizado</option>
                  <option value="cancelled">Anulado</option>
                </select>
              </div>
            ) : (
              <section className="space-y-3 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Plan de cuotas</h3>
                    <p className="text-sm text-gray-500">La suma de las cuotas debe coincidir con el total.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setInstallments((current) => [...current, emptyInstallment()])}
                    disabled={isSaving}
                  >
                    Agregar cuota
                  </Button>
                </div>
                {installments.map((installment, index) => (
                  <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <Input
                      label={`Cuota ${index + 1} · monto CLP`}
                      type="number"
                      min="1"
                      step="1"
                      value={installment.amount}
                      onChange={(event) => updateInstallment(index, { amount: event.target.value })}
                      disabled={isSaving}
                      required
                    />
                    <Input
                      label="Fecha de vencimiento"
                      type="date"
                      value={installment.dueDate}
                      onChange={(event) => updateInstallment(index, { dueDate: event.target.value })}
                      disabled={isSaving}
                      required
                    />
                    {installments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setInstallments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        disabled={isSaving}
                        aria-label={`Eliminar cuota ${index + 1}`}
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                ))}
              </section>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {contract ? 'Guardar cambios' : 'Crear contrato'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

ClientContractFormModal.displayName = 'ClientContractFormModal';
