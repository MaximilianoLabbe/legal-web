import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/layout';
import { Card, Button, Alert } from '../components/ui';
import { useCaseStore } from '../store/caseStore';
import { useClientStore } from '../store/clientStore';
import { useAuthStore } from '../store/authStore';
import { FiArrowLeft } from 'react-icons/fi';

export const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createCase, error: caseError } = useCaseStore();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore();

  // Get client_id from location state if passed from client details page
  const preselectedClientId = (location.state as any)?.clientId || '';

  const [formData, setFormData] = useState({
    client_id: preselectedClientId,
    tipo: '',
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    estado: 'abierto',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) {
      newErrors.client_id = 'El cliente es requerido';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de caso es requerido';
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === 'client_id' && !value) {
      newErrors.client_id = 'El cliente es requerido';
    } else if (name === 'client_id') {
      delete newErrors.client_id;
    }

    if (name === 'tipo' && !value) {
      newErrors.tipo = 'El tipo de caso es requerido';
    } else if (name === 'tipo') {
      delete newErrors.tipo;
    }

    if (name === 'descripcion' && !value) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (name === 'descripcion') {
      delete newErrors.descripcion;
    }

    if (name === 'fecha_inicio' && !value) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    } else if (name === 'fecha_inicio') {
      delete newErrors.fecha_inicio;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error('Usuario no identificado');
      }
      await createCase(
        user.id,
        formData.client_id,
        formData.tipo,
        formData.estado,
        formData.descripcion,
        formData.fecha_inicio,
        formData.fecha_fin
      );
      navigate('/cases');
    } catch (error) {
      console.error('Error creating case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const caseTypes = [
    'Civil',
    'Penal',
    'Laboral',
    'Administrativo',
    'Mercantil',
    'Familia',
    'Otro'
  ];

  const caseStates = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'cerrado', label: 'Cerrado' },
    { value: 'pausado', label: 'Pausado' }
  ];

  return (
    <div>
      <Header
        title="Crear Nuevo Caso"
        subtitle="Ingresa los detalles del nuevo caso legal"
      />

      <div className="p-6 max-w-2xl mx-auto">
        {caseError && (
          <Alert type="error" title="Error" message={caseError} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombre} ({client.rut})
                  </option>
                ))}
              </select>
              {touched.client_id && errors.client_id && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.client_id}</p>
              )}
            </div>

            {/* Case Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipo de Caso <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              >
                <option value="">Selecciona un tipo</option>
                {caseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {touched.tipo && errors.tipo && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.tipo}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe el caso..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400 resize-none"
                rows={4}
              />
              {touched.descripcion && errors.descripcion && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.descripcion}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              />
              {touched.fecha_inicio && errors.fecha_inicio && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.fecha_inicio}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Fecha de Fin <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              />
            </div>

            {/* Case State */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Estado del Caso
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              >
                {caseStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/cases')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <FiArrowLeft size={18} />
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creando...' : 'Crear Caso'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

CreateCasePage.displayName = 'CreateCasePage';
