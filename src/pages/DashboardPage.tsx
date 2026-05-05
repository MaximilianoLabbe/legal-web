import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Calendar } from '../components/common';
import { Card, Badge, Alert } from '../components/ui';
import { useClientStore } from '../store/clientStore';
import { useCaseStore } from '../store/caseStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { FiPlus, FiUsers, FiFileText, FiCalendar } from 'react-icons/fi';
import type { Client, Case } from '../types';

interface Meeting {
  id: string;
  date: Date;
  title: string;
  time: string;
  client?: string;
  type: 'reunion' | 'audiencia' | 'entrega' | 'otro';
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientStore();
  const { cases, fetchCases } = useCaseStore();
  const { myTasks, fetchMyTasks } = useTaskStore();
  const [meetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load clients
        await fetchClients();
        
        // Load cases based on user role
        if (user?.id) {
          if (user.role === 'admin') {
            // Admin: fetch all cases
            await fetchCases();
          } else {
            // Lawyer: fetch only their cases
            await fetchCases(user.id);
          }
        }

        // Load user's tasks
        await fetchMyTasks();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    loadData();
    
  }, []);

  // Convert tasks to meetings format for calendar display
  const tasksAsMeetings: Meeting[] = myTasks.map(task => {
    const taskDate = new Date(task.fecha_vencimiento);
    return {
      id: task.id,
      date: taskDate,
      title: task.titulo,
      time: '09:00', // Default time since tasks don't have specific times
      type: task.prioridad === 'high' ? 'audiencia' : 'reunion',
      client: undefined
    };
  });

  // Combine meetings and tasks
  const allMeetings = [...meetings, ...tasksAsMeetings];

  // Calculate stats
  const activeClients = clients.length;
  const activeCases = cases.filter(c => c.estado !== 'cerrado').length;
  const closedCases = cases.filter(c => c.estado === 'cerrado').length;
  const pendingTasks = myTasks.filter(t => t.estado === 'pending' || t.estado === 'in_progress').length;

  // Get recent items
  const recentClients = clients.slice(0, 5);
  const recentCases = cases.slice(0, 5);

  const handleNavigateToClients = () => navigate('/clients');
  const handleNavigateToCases = () => navigate('/cases');
  const handleCreateClient = () => navigate('/clients/new');
  const handleCreateCase = () => navigate('/cases/new');

  return (
    <div>
      <Header
        title="Panel de Control"
        subtitle="Bienvenido al sistema de gestión legal"
      />

      <div className="p-6 space-y-6">
        {/* Welcome Alert */}
        <Alert
          type="info"
          title="Bienvenido"
          message={`Hola ${user?.firstName}, aquí está tu resumen actualizado.`}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{activeClients}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl text-2xl">👥</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Casos Activos</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{activeCases}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-xl text-2xl">📋</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Casos Cerrados</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{closedCases}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl text-2xl">✓</div>
            </div>
          </Card>

          {user?.role !== 'admin' && (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tareas Pendientes</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{pendingTasks}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl text-2xl">⚠</div>
              </div>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Clients and Cases */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clients Section */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUsers className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
                    <p className="text-sm text-gray-600">{activeClients} clientes registrados</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateClient}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FiPlus size={18} />
                  Nuevo
                </button>
              </div>

              <div className="space-y-3">
                {recentClients.length > 0 ? (
                  <>
                    {recentClients.map((client: Client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        onClick={() => navigate(`/clients`)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{client.nombre}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          {client.telefono && (
                            <p className="text-xs text-gray-500 mt-1">{client.telefono}</p>
                          )}
                        </div>
                        <Badge variant="primary">{client.rut}</Badge>
                      </div>
                    ))}
                    {clients.length > 5 && (
                      <button
                        onClick={handleNavigateToClients}
                        className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        Ver todos los clientes →
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes clientes registrados</p>
                    <button
                      onClick={handleCreateClient}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      <FiPlus size={16} />
                      Crear primer cliente
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Cases Section */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiFileText className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Casos</h2>
                    <p className="text-sm text-gray-600">{activeCases} casos activos</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateCase}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  <FiPlus size={18} />
                  Nuevo
                </button>
              </div>

              <div className="space-y-3">
                {recentCases.length > 0 ? (
                  <>
                    {recentCases.map((caseItem: Case) => (
                      <div
                        key={caseItem.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        onClick={() => navigate(`/cases`)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{caseItem.descripcion || caseItem.tipo}</p>
                          <p className="text-sm text-gray-600">Tipo: {caseItem.tipo}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Iniciado: {new Date(caseItem.fecha_inicio).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            caseItem.estado === 'abierto'
                              ? 'primary'
                              : caseItem.estado === 'en_progreso'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {caseItem.estado}
                        </Badge>
                      </div>
                    ))}
                    {cases.length > 5 && (
                      <button
                        onClick={handleNavigateToCases}
                        className="w-full py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        Ver todos los casos →
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes casos registrados</p>
                    <button
                      onClick={handleCreateCase}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                    >
                      <FiPlus size={16} />
                      Crear primer caso
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {user?.role !== 'admin' && (
            <div className="lg:col-span-1">
              <Calendar meetings={allMeetings} />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleCreateClient}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all border border-blue-200"
            >
              <div className="p-2 bg-blue-200 rounded-lg">
                <FiPlus className="text-blue-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Nuevo Cliente</span>
            </button>

            <button
              onClick={handleCreateCase}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:shadow-lg transition-all border border-yellow-200"
            >
              <div className="p-2 bg-yellow-200 rounded-lg">
                <FiFileText className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Nuevo Caso</span>
            </button>

            <button
              onClick={() => navigate('/clients')}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all border border-purple-200"
            >
              <div className="p-2 bg-purple-200 rounded-lg">
                <FiUsers className="text-purple-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Ver Clientes</span>
            </button>

            <button
              onClick={() => navigate('/cases')}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all border border-green-200"
            >
              <div className="p-2 bg-green-200 rounded-lg">
                <FiCalendar className="text-green-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">Ver Casos</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
