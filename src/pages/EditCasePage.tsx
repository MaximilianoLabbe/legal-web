import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout';
import { Card, Alert, Button } from '../components/ui';
import { DocumentUploadModal, DocumentsList } from '../components/common';
import { useCaseStore } from '../store/caseStore';
import { useClientStore } from '../store/clientStore';
import { FiUpload } from 'react-icons/fi';

export const EditCasePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCaseById, updateCase, error: caseError } = useCaseStore();
  const { clients, fetchClients } = useClientStore();

  const [formData, setFormData] = useState({
    client_id: '',
    tipo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'abierto',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documentsRefresh, setDocumentsRefresh] = useState(0);

  // Load clients and case on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchClients();
        if (caseId) {
          const caseData = await getCaseById(caseId);
          setFormData({
            client_id: caseData.client_id,
            tipo: caseData.tipo,
            descripcion: caseData.descripcion,
            fecha_inicio: caseData.fecha_inicio,
            fecha_fin: caseData.fecha_fin || '',
            estado: caseData.estado,
          });
        }
      } catch (error) {
        console.error('Error loading case:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId, fetchClients, getCaseById]);

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

    setIsSaving(true);
    try {
      if (caseId) {
        await updateCase(caseId, {
          client_id: formData.client_id,
          tipo: formData.tipo,
          estado: formData.estado as 'abierto' | 'en_progreso' | 'cerrado' | 'pausado',
          descripcion: formData.descripcion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin || null,
        });
      }
      navigate('/cases');
    } catch (error) {
      console.error('Error updating case:', error);
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div>
        <Header
          title="Editar Caso"
          subtitle="Actualizando detalles del caso"
        />
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <p className="text-gray-500">Cargando caso...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Editar Caso"
        subtitle="Actualiza los detalles del caso legal"
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

            {/* Type Selection */}
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

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              >
                {caseStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
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
                placeholder="Describe los detalles del caso"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
              />
              {touched.descripcion && errors.descripcion && (
                <p className="mt-2 text-sm text-red-500 font-medium">{errors.descripcion}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>

        {/* Documents Section */}
        {caseId && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2"
              >
                <FiUpload size={18} />
                Subir Documento
              </Button>
            </div>
            <DocumentsList caseId={caseId} refreshTrigger={documentsRefresh} />
          </div>
        )}

        {/* Upload Modal */}
        {caseId && (
          <DocumentUploadModal
            caseId={caseId}
            caseName={formData.descripcion}
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => setDocumentsRefresh(prev => prev + 1)}
          />
        )}
      </div>
    </div>
  );
};
