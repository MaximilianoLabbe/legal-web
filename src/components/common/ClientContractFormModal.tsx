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

const monthlyDueDate = (firstDate: string, monthOffset: number) => {
  const [year, month, day] = firstDate.split('-').map(Number);
  const monthIndex = year * 12 + month - 1 + monthOffset;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = monthIndex % 12;
  const lastDayOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(targetYear, targetMonth, Math.min(day, lastDayOfMonth))
  ).toISOString().slice(0, 10);
};

const calculateInstallments = (amount: number, count: number, firstDate: string) => {
  if (
    !Number.isSafeInteger(amount) ||
    !Number.isSafeInteger(count) ||
    amount <= 0 ||
    count <= 0 ||
    count > amount ||
    !firstDate
  ) {
    return [];
  }

  const installmentAmount = Math.floor(amount / count);
  const remainder = amount % count;
  return Array.from({ length: count }, (_value, index) => ({
    amount: installmentAmount + (index === count - 1 ? remainder : 0),
    due_date: monthlyDueDate(firstDate, index),
  }));
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
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
  const [installmentCount, setInstallmentCount] = useState('1');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const selectedClient = clients.find((client) => client.id === clientId);
  const parsedTotal = Number(totalAmount);
  const parsedInitialAmount = hasInitialPayment ? Number(initialPaymentAmount) : 0;
  const parsedInstallmentCount = Number(installmentCount);
  const totalIsValid = Number.isSafeInteger(parsedTotal) && parsedTotal > 0;
  const initialCoversTotal =
    hasInitialPayment &&
    totalIsValid &&
    Number.isSafeInteger(parsedInitialAmount) &&
    parsedInitialAmount === parsedTotal;
  const remainingBalance = totalIsValid
    ? Math.max(parsedTotal - (Number.isSafeInteger(parsedInitialAmount) ? parsedInitialAmount : 0), 0)
    : null;
  const installmentCountMax =
    remainingBalance === null ? undefined : Math.max(1, remainingBalance);
  const canPreviewInstallments =
    remainingBalance !== null &&
    remainingBalance > 0 &&
    Number.isSafeInteger(parsedInstallmentCount) &&
    parsedInstallmentCount > 0 &&
    installmentCountMax !== undefined &&
    parsedInstallmentCount <= installmentCountMax &&
    Boolean(firstInstallmentDate) &&
    firstInstallmentDate > signedAt;
  const calculatedInstallments = canPreviewInstallments
    ? calculateInstallments(remainingBalance, parsedInstallmentCount, firstInstallmentDate)
    : [];

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
        const scheduledBalance = total - initialAmount;
        if (scheduledBalance > 0) {
          if (
            !Number.isSafeInteger(parsedInstallmentCount) ||
            parsedInstallmentCount < 1
          ) {
            setError('El número de cuotas debe ser un entero mayor que cero.');
            return;
          }
          if (parsedInstallmentCount > scheduledBalance) {
            setError('El número de cuotas no puede superar el saldo en pesos.');
            return;
          }
          if (!firstInstallmentDate || firstInstallmentDate <= signedAt) {
            setError('La fecha de la primera cuota debe ser posterior a la fecha de firma.');
            return;
          }
        }

        const validInstallments =
          scheduledBalance > 0
            ? calculateInstallments(
                scheduledBalance,
                parsedInstallmentCount,
                firstInstallmentDate
              )
            : [];
        if (scheduledBalance > 0 && validInstallments.length !== parsedInstallmentCount) {
          setError('No se pudo calcular el plan de cuotas. Revisa el monto, la cantidad y la fecha.');
          return;
        }
        const scheduledTotal = validInstallments.reduce((sum, installment) => sum + installment.amount, 0);
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
                        setHasInitialPayment(event.target.checked);
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
                  </div>
                  {hasInitialPayment && initialCoversTotal ? (
                    <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                      El pago inicial cubre el total; no se requieren cuotas mensuales.
                    </p>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label={`Número de cuotas mensuales${hasInitialPayment ? ' (sin incluir el pago inicial)' : ''}`}
                          type="number"
                          min="1"
                          max={installmentCountMax}
                          step="1"
                          value={installmentCount}
                          onChange={(event) => setInstallmentCount(event.target.value)}
                          disabled={isSaving}
                          required
                        />
                        <Input
                          label="Fecha de la primera cuota"
                          type="date"
                          min={nextDate(signedAt)}
                          value={firstInstallmentDate}
                          onChange={(event) => setFirstInstallmentDate(event.target.value)}
                          disabled={isSaving}
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Las cuotas siguientes vencerán el mismo día de cada mes. Si un mes no tiene ese día,
                        se usará el último día del mes. El saldo se divide automáticamente y cualquier
                        diferencia de pesos se agrega a la última cuota.
                      </p>
                      {calculatedInstallments.length > 0 && (
                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-100 p-3">
                          {calculatedInstallments.map((installment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="font-medium text-gray-800">
                                Cuota {index + (hasInitialPayment ? 2 : 1)}
                              </span>
                              <span className="text-gray-600">
                                {formatCurrency(installment.amount)} · {formatDate(installment.due_date)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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
