import React, { useState } from 'react';
import { Alert, Button, Card, Input } from '../ui';
import { getErrorMessage } from '../../utils';
import type { ContractInstallment, PaymentMethod } from '../../types';

interface InstallmentPaymentModalProps {
  installment: ContractInstallment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: {
    paid_at: string;
    payment_method: PaymentMethod;
    payment_reference: string;
  }) => Promise<void>;
}

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export const InstallmentPaymentModal: React.FC<InstallmentPaymentModalProps> = ({
  installment,
  isOpen,
  onClose,
  onSave,
}) => {
  const [paidAt, setPaidAt] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!paidAt) {
      setError('Ingresa la fecha en que se recibió el pago.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        paid_at: paidAt,
        payment_method: paymentMethod,
        payment_reference: reference.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo registrar el pago.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !installment) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">Registrar pago de cuota</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">
            Cuota {installment.number} · {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              maximumFractionDigits: 0,
            }).format(installment.amount)}
          </p>

          {error && (
            <div className="mb-4">
              <Alert type="error" title="No se pudo registrar" message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Fecha de pago"
              type="date"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              disabled={isSaving}
              required
            />
            <div>
              <label htmlFor="payment-method" className="mb-2 block text-sm font-medium text-gray-700">
                Medio de pago
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                disabled={isSaving}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="transfer">Transferencia</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <Input
              label="Referencia o comprobante (opcional)"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="N.º de operación"
              disabled={isSaving}
            />
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Confirmar pago
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

InstallmentPaymentModal.displayName = 'InstallmentPaymentModal';
