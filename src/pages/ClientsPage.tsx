import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Button, Card, Alert } from '../components/ui';
import { useClientStore } from '../store/clientStore';
import type { Client } from '../types';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, isLoading, error, fetchClients, deleteClient } = useClientStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
      try {
        await deleteClient(id);
        setLocalError(null);
      } catch (error: any) {
        setLocalError(error.response?.data?.message || 'Error al eliminar cliente');
      }
    }
  };

  return (
    <div>
      <Header
        title="Gestión de Clientes"
        subtitle="Administra todos tus clientes"
        action={
          <Button
            variant="primary"
            onClick={() => navigate('/clients/create')}
            className="flex items-center gap-2"
          >
            <FiPlus size={20} />
            Nuevo Cliente
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={() => setLocalError(null)}
          />
        )}

        {localError && (
          <Alert
            type="error"
            title="Error"
            message={localError}
            onClose={() => setLocalError(null)}
          />
        )}

        {isLoading ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">Cargando clientes...</p>
          </Card>
        ) : clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client: Client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{client.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">RUT: {client.rut}</p>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-700">📧 {client.email}</p>
                  <p className="text-sm text-gray-700">📱 {client.telefono}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                  >
                    <FiEdit2 size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleDeleteClient(client.id, client.nombre)}
                  >
                    <FiTrash2 size={16} />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay clientes registrados</p>
            <Button
              variant="primary"
              onClick={() => navigate('/clients/create')}
            >
              Crear primer cliente
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

ClientsPage.displayName = 'ClientsPage';
