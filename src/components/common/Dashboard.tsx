import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useClientStore } from '../../store/clientStore';
import { useCaseStore } from '../../store/caseStore';
import { Card, Badge, Alert } from '../ui';
import type { Case } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientStore();
  const { cases, fetchCases, getCasesByUser } = useCaseStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchClients();
      // Fetch cases based on user role
      if (user?.role === 'admin') {
        await fetchCases();
      } else if (user?.id) {
        // Lawyer: fetch only their cases
        await getCasesByUser(user.id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Primero filtramos por usuario (si es lawyer, solo sus clientes; si es admin, todos)
  let casesForUser = cases;
  
  // Get client name by client_id
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.nombre || 'Cliente desconocido';
  };

  // Calculate stats
  const clientsCount = user?.role === 'admin' ? clients.length : clients.filter(c => c.user_id === user?.id).length;
  const activeCases = casesForUser.filter(
    c => c.estado === 'abierto' || c.estado === 'en_progreso'
  );
  const closedCases = casesForUser.filter(c => c.estado === 'cerrado');

  const statsArray = [
    { label: 'Clientes', value: clientsCount.toString(), color: 'bg-blue-50', icon: '👥' },
    { label: 'Casos Activos', value: activeCases.length.toString(), color: 'bg-yellow-50', icon: '📋' },
    { label: 'Casos Cerrados', value: closedCases.length.toString(), color: 'bg-green-50', icon: '✓' },
    { label: 'Tareas Pendientes', value: activeCases.length.toString(), color: 'bg-red-50', icon: '⚠' },
  ];

  // Get recent cases (last 5)
  const recentCases = casesForUser.slice(-5).reverse();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Alert */}
      <Alert
        type="info"
        title="Bienvenido"
        message={`Hola ${user?.firstName} ${user?.lastName}, aquí está tu resumen diario.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsArray.map((stat) => (
          <Card key={stat.label} className={stat.color}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Cases */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Casos Recientes</h2>
        <div className="space-y-3">
          {recentCases.length > 0 ? (
            recentCases.map((caseItem: Case) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{caseItem.tipo}</p>
                  <p className="text-sm text-gray-600">{getClientName(caseItem.client_id)}</p>
                </div>
                <Badge
                  variant={
                    caseItem.estado === 'abierto'
                      ? 'primary'
                      : caseItem.estado === 'en_progreso'
                      ? 'warning'
                      : caseItem.estado === 'cerrado'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {caseItem.estado === 'abierto'
                    ? 'Abierto'
                    : caseItem.estado === 'en_progreso'
                    ? 'En Progreso'
                    : caseItem.estado === 'cerrado'
                    ? 'Cerrado'
                    : 'Pausado'}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay casos recientes
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

Dashboard.displayName = 'Dashboard';
