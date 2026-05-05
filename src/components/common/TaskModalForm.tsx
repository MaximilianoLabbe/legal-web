import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Alert } from '../ui';
import type { Task, TaskPriority } from '../../types';
import type { Case } from '../../types';

interface TaskModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  caseId?: string;
  users: any[];
  cases?: Case[];
  initialData?: Task | null;
  title?: string;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baja', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' },
];

export const TaskModalForm: React.FC<TaskModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  caseId = '',
  users = [],
  cases = [],
  initialData,
  title = 'Nueva Tarea',
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'medium' as TaskPriority,
    assigned_to_id: '',
    case_id: caseId,
    fecha_vencimiento: '',
    hora: '09:00',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      const dateTimeParts = initialData.fecha_vencimiento.split('T');
      const fecha = dateTimeParts[0];
      const time = dateTimeParts[1]?.substring(0, 5) || '09:00';
      setFormData({
        titulo: initialData.titulo,
        descripcion: initialData.descripcion,
        prioridad: initialData.prioridad,
        assigned_to_id: initialData.assigned_to_id,
        case_id: initialData.case_id,
        fecha_vencimiento: fecha,
        hora: time,
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'medium',
        assigned_to_id: '',
        case_id: caseId || '',
        fecha_vencimiento: '',
        hora: '09:00',
      });
    }
  }, [initialData, isOpen, caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.case_id) {
      setError('Debes seleccionar un caso');
      return;
    }
    if (!formData.assigned_to_id) {
      setError('Debes asignar la tarea a alguien');
      return;
    }
    if (!formData.fecha_vencimiento) {
      setError('La fecha de vencimiento es requerida');
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time into ISO string
      const dateTime = new Date(`${formData.fecha_vencimiento}T${formData.hora}:00`);
      const submitData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: formData.prioridad,
        assigned_to_id: formData.assigned_to_id,
        case_id: formData.case_id,
        fecha_vencimiento: dateTime.toISOString(),
      };
      await onSubmit(submitData);
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar tarea';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'medium',
      assigned_to_id: '',
      case_id: '',
      fecha_vencimiento: '',
      hora: '09:00',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">Crea o edita una tarea para este caso</p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caso *
            </label>
            <select
              value={formData.case_id}
              onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Selecciona un caso</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descripcion} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <Input
              type="text"
              placeholder="Ej: Revisar contrato de cliente"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Detalla qué hay que hacer..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, prioridad: p.value })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    formData.prioridad === p.value
                      ? p.color
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignar a
            </label>
            <select
              value={formData.assigned_to_id}
              onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Selecciona un usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento
              </label>
              <Input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                className="w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <Input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
