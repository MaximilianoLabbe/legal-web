import React, { useState } from 'react';
import { Alert, Button, Card, Input } from '../ui';
import { getErrorMessage } from '../../utils';
import type {
  Client,
  ClientContract,
  ClientContractStatus,
  CreateClientContractInput,
  PaymentMethod,
  UpdateClientContractInput,
} from '../../types';

interface InstallmentDraft {
  amount: string;
  dueDate: string;
}

interface InitialPaymentInput {
  paid_at: string;
  payment_method: PaymentMethod;
  payment_reference: string;
}

interface ClientContractFormModalProps {
  clients: Client[];
  contract: ClientContract | null;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    input: CreateClientContractInput,
    initialPayment: InitialPaymentInput | null
  ) => Promise<void>;
  onUpdate: (id: string, input: UpdateClientContractInput) => Promise<void>;
}

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const emptyInstallment = (): InstallmentDraft => ({ amount: '', dueDate: '' });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

const nextDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  other: 'Otro',
};

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
  const [hasInitialPayment, setHasInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState('');
  const [initialPaymentTiming, setInitialPaymentTiming] = useState<'at-signing' | 'after-signing'>(
    'at-signing'
  );
  const [initialPaymentDueDate, setInitialPaymentDueDate] = useState('');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<PaymentMethod>('transfer');
  const [initialPaymentReference, setInitialPaymentReference] = useState('');
  const [installments, setInstallments] = useState<InstallmentDraft[]>(
    contract?.installments.map((installment) => ({
      amount: String(installment.amount),
      dueDate: installment.due_date.slice(0, 10),
    })) ?? [emptyInstallment()]
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const selectedClient = clients.find((client) => client.id === clientId);
  const parsedTotal = Number(totalAmount);
  const parsedInitialAmount = hasInitialPayment ? Number(initialPaymentAmount) : 0;
  const totalIsValid = Number.isSafeInteger(parsedTotal) && parsedTotal > 0;
  const initialCoversTotal =
    hasInitialPayment &&
    totalIsValid &&
    Number.isSafeInteger(parsedInitialAmount) &&
    parsedInitialAmount === parsedTotal;
  const remainingBalance = totalIsValid
    ? Math.max(parsedTotal - (Number.isSafeInteger(parsedInitialAmount) ? parsedInitialAmount : 0), 0)
    : null;

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
        const total = parsedTotal;
        const initialAmount = parsedInitialAmount;
        const regularInstallments = initialCoversTotal ? [] : installments;
        const validInstallments = regularInstallments.map((installment) => ({
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
          hasInitialPayment &&
          (!Number.isSafeInteger(initialAmount) || initialAmount <= 0 || initialAmount > total)
        ) {
          setError('El pago inicial debe ser un monto entero mayor que cero y no superar el total.');
          return;
        }
        if (
          hasInitialPayment &&
          initialPaymentTiming === 'after-signing' &&
          (!initialPaymentDueDate || initialPaymentDueDate <= signedAt)
        ) {
          setError('La fecha del pago inicial posterior debe ser después de la fecha de firma.');
          return;
        }
        if (
          regularInstallments.length === 0 &&
          !(hasInitialPayment && initialAmount === total)
        ) {
          setError('Agrega al menos una cuota para cubrir el saldo del contrato.');
          return;
        }
        if (
          validInstallments.some(
            (installment) =>
              !Number.isSafeInteger(installment.amount) ||
              installment.amount <= 0 ||
              !installment.due_date ||
              installment.due_date < signedAt
          )
        ) {
          setError('Cada cuota debe tener un monto entero y una fecha igual o posterior a la firma.');
          return;
        }
        const scheduledTotal = validInstallments.reduce(
          (sum, installment) => sum + installment.amount,
          0
        );
        if (!Number.isSafeInteger(scheduledTotal + initialAmount) || scheduledTotal + initialAmount !== total) {
          setError('El pago inicial más la suma de las cuotas debe ser igual al monto total del contrato.');
          return;
        }

        const contractInstallments = [
          ...(hasInitialPayment
            ? [
                {
                  number: 1,
                  amount: initialAmount,
                  due_date:
                    initialPaymentTiming === 'at-signing'
                      ? signedAt
                      : initialPaymentDueDate,
                },
              ]
            : []),
          ...validInstallments.map((installment, index) => ({
            ...installment,
            number: index + (hasInitialPayment ? 2 : 1),
          })),
        ];

        await onCreate({
          client_id: clientId,
          title: title.trim(),
          description: description.trim(),
          signed_at: signedAt,
          total_amount: total,
          currency: 'CLP',
          installments: contractInstallments,
        }, hasInitialPayment && initialPaymentTiming === 'at-signing'
          ? {
              paid_at: signedAt,
              payment_method: initialPaymentMethod,
              payment_reference: initialPaymentReference.trim(),
            }
          : null);
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

                {selectedClient && (
                  <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Datos del cliente</h3>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-gray-500">Nombre</dt>
                        <dd className="font-medium text-gray-900">{selectedClient.nombre}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">RUT</dt>
                        <dd className="font-medium text-gray-900">{selectedClient.rut}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Teléfono</dt>
                        <dd className="font-medium text-gray-900">{selectedClient.telefono}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Correo electrónico</dt>
                        <dd className="font-medium text-gray-900">{selectedClient.email}</dd>
                      </div>
                    </dl>
                  </section>
                )}

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
              <>
                <section className="space-y-4 rounded-xl border border-gray-200 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={hasInitialPayment}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        setHasInitialPayment(enabled);
                        if (!enabled && installments.length === 0) {
                          setInstallments([emptyInstallment()]);
                        }
                      }}
                      disabled={isSaving}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <span className="block font-semibold text-gray-900">Incluir pago inicial</span>
                      <span className="text-sm text-gray-500">
                        El monto se descuenta del total y se registra como pagado o pendiente.
                      </span>
                    </span>
                  </label>

                  {hasInitialPayment && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      <Input
                        label="Monto del pago inicial (CLP)"
                        type="number"
                        min="1"
                        max={totalAmount || undefined}
                        step="1"
                        value={initialPaymentAmount}
                        onChange={(event) => setInitialPaymentAmount(event.target.value)}
                        disabled={isSaving}
                        required
                      />

                      <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium text-gray-700">
                          ¿Cuándo se recibe?
                        </legend>
                        <label className="flex items-start gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="initial-payment-timing"
                            value="at-signing"
                            checked={initialPaymentTiming === 'at-signing'}
                            onChange={() => setInitialPaymentTiming('at-signing')}
                            disabled={isSaving}
                            className="mt-1"
                          />
                          <span>
                            Al firmar · se registrará como pagado el {signedAt || 'día de firma'}.
                          </span>
                        </label>
                        <label className="flex items-start gap-2 text-sm text-gray-700">
                          <input
                            type="radio"
                            name="initial-payment-timing"
                            value="after-signing"
                            checked={initialPaymentTiming === 'after-signing'}
                            onChange={() => setInitialPaymentTiming('after-signing')}
                            disabled={isSaving}
                            className="mt-1"
                          />
                          <span>Después de la firma · quedará pendiente hasta registrar el pago.</span>
                        </label>
                      </fieldset>

                      {initialPaymentTiming === 'after-signing' ? (
                        <Input
                          label="Fecha pactada para el pago inicial"
                          type="date"
                          min={nextDate(signedAt)}
                          value={initialPaymentDueDate}
                          onChange={(event) => setInitialPaymentDueDate(event.target.value)}
                          disabled={isSaving}
                          required
                        />
                      ) : (
                        <>
                          <div>
                            <label
                              htmlFor="initial-payment-method"
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Medio de pago
                            </label>
                            <select
                              id="initial-payment-method"
                              value={initialPaymentMethod}
                              onChange={(event) =>
                                setInitialPaymentMethod(event.target.value as PaymentMethod)
                              }
                              disabled={isSaving}
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="Referencia o comprobante (opcional)"
                            value={initialPaymentReference}
                            onChange={(event) => setInitialPaymentReference(event.target.value)}
                            placeholder="N.º de operación"
                            disabled={isSaving}
                          />
                        </>
                      )}
                    </div>
                  )}
                </section>

                <section className="space-y-3 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Cuotas pactadas</h3>
                      <p className="text-sm text-gray-500">
                        {remainingBalance !== null
                          ? `Saldo a distribuir: ${formatCurrency(remainingBalance)}`
                          : 'Ingresa el monto total para calcular el saldo.'}
                      </p>
                    </div>
                    {!(hasInitialPayment && initialCoversTotal) && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setInstallments((current) => [...current, emptyInstallment()])}
                        disabled={isSaving}
                      >
                        Agregar cuota
                      </Button>
                    )}
                  </div>
                  {hasInitialPayment && initialCoversTotal ? (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                      El pago inicial cubre el total; no se requieren cuotas adicionales.
                    </p>
                  ) : (
                    installments.map((installment, index) => (
                      <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          label={`Cuota ${index + (hasInitialPayment ? 2 : 1)} · monto CLP`}
                          type="number"
                          min="1"
                          step="1"
                          value={installment.amount}
                          onChange={(event) => updateInstallment(index, { amount: event.target.value })}
                          disabled={isSaving}
                          required
                        />
                        <Input
                          label="Fecha de pago"
                          type="date"
                          min={signedAt}
                          value={installment.dueDate}
                          onChange={(event) => updateInstallment(index, { dueDate: event.target.value })}
                          disabled={isSaving}
                          required
                        />
                        {(installments.length > 1 || hasInitialPayment) && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setInstallments((current) =>
                                current.filter((_, itemIndex) => itemIndex !== index)
                              )
                            }
                            disabled={isSaving}
                            aria-label={`Eliminar cuota ${index + (hasInitialPayment ? 2 : 1)}`}
                          >
                            Quitar
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </section>
              </>
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
