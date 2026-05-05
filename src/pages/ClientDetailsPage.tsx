import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Card, Button, Badge, Alert } from '../components/ui';
import { useClientStore } from '../store/clientStore';
import { useCaseStore } from '../store/caseStore';
import { FiArrowLeft, FiPlus, FiEdit2 } from 'react-icons/fi';
import type { Case } from '../types';

export const ClientDetailsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients } = useClientStore();
  const { cases, fetchCases, deleteCase } = useCaseStore();
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId);

  useEffect(() => {
    const loadClientCases = async () => {
      try {
        setIsLoading(true);
        await fetchCases();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error cargando casos');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientCases();
  }, [fetchCases]);

  // Filter cases by client
  useEffect(() => {
    if (clientId) {
      const filtered = cases.filter((c) => c.client_id === clientId);
      setClientCases(filtered);
    }
  }, [cases, clientId]);

  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este caso?')) {
      try {
        await deleteCase(caseId);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar caso');
      }
    }
  };

  const stateColors: Record<string, 'primary' | 'warning' | 'success' | 'danger'> = {
    abierto: 'primary',
    en_progreso: 'warning',
    cerrado: 'success',
    pausado: 'danger',
  };

  const stateLabels: Record<string, string> = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    cerrado: 'Cerrado',
    pausado: 'Pausado',
  };

  if (!client) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 mb-4"
        >
          <FiArrowLeft size={18} />
          Volver
        </Button>
        <Card className="text-center py-12">
          <p className="text-gray-500">Cliente no encontrado</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Cliente: ${client.nombre}`}
        subtitle="Detalles y casos del cliente"
        action={
          <Button
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2"
          >
            <FiArrowLeft size={20} />
            Volver
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Client Info Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.nombre}</h2>
              <p className="text-sm text-gray-600 mt-1">RUT: {client.rut}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-lg font-medium text-gray-900">{client.telefono}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-blue-200">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate(`/clients/${client.id}/edit`)}
              >
                <FiEdit2 size={16} />
                Editar Cliente
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate('/cases/new', { state: { clientId: client.id, clientName: client.nombre } })}
              >
                <FiPlus size={16} />
                Nuevo Caso
              </Button>
            </div>
          </div>
        </Card>

        {/* Cases Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Casos del Cliente ({clientCases.length})
          </h3>

          {isLoading ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">Cargando casos...</p>
            </Card>
          ) : clientCases.length > 0 ? (
            <div className="space-y-4">
              {clientCases.map((caseItem: Case) => (
                <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{caseItem.tipo}</h4>
                        <Badge variant={stateColors[caseItem.estado]}>
                          {stateLabels[caseItem.estado]}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{caseItem.descripcion}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>📅 Inicio: {new Date(caseItem.fecha_inicio).toLocaleDateString('es-MX')}</p>
                        {caseItem.fecha_fin && (
                          <p>
                            📅 Fin:{' '}
                            {new Date(caseItem.fecha_fin).toLocaleDateString('es-MX')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/cases/${caseItem.id}/edit`)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteCase(caseItem.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay casos asociados a este cliente</p>
              <Button
                variant="primary"
                onClick={() => navigate('/cases/new', { state: { clientId: client.id, clientName: client.nombre } })}
                className="flex items-center justify-center gap-2"
              >
                <FiPlus size={18} />
                Crear Primer Caso
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

ClientDetailsPage.displayName = 'ClientDetailsPage';
