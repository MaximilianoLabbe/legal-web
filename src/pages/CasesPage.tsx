import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Card, Button, Badge, Alert } from '../components/ui';
import { DocumentUploadModal, CaseDetailModal } from '../components/common';
import { useCaseStore } from '../store/caseStore';
import { useClientStore } from '../store/clientStore';
import { useAuthStore } from '../store/authStore';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import type { Case } from '../types';

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cases, fetchCases, getCasesByUser, deleteCase, error } = useCaseStore();
  const { clients, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Función helper para obtener el nombre del cliente
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.nombre || 'Cliente desconocido';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchClients()]);
      // Fetch cases based on user role
      if (user?.role === 'admin') {
        await fetchCases();
      } else if (user?.id) {
        // Lawyer: fetch only their cases
        await getCasesByUser(user.id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este caso?')) {
      try {
        await deleteCase(id);
        await loadData();
      } catch (err) {
        console.error('Error deleting case:', err);
      }
    }
  };

  const handleOpenDetailModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCase(null);
  };

  const handleOpenUploadModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsUploadModalOpen(true);
  };



  // Primero filtramos por usuario (si es lawyer, solo sus clientes; si es admin, todos)
  let casesForUser = cases;
  
  // Luego aplicamos los filtros de búsqueda y estado
  const filteredCases = casesForUser.filter((caseItem: Case) => {
    const matchesSearch =
      caseItem.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || caseItem.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stateColors: Record<string, 'primary' | 'warning' | 'success' | 'danger'> = {
    abierto: 'primary',
    en_progreso: 'warning',
    cerrado: 'success',
    pausado: 'danger'
  };

  return (
    <div>
      <Header
        title="Gestión de Casos"
        subtitle="Administra todos tus casos legales"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {error && (
          <Alert type="error" title="Error" message={error} />
        )}

        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Por descripción o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_progreso">En Progreso</option>
              <option value="cerrado">Cerrado</option>
              <option value="pausado">Pausado</option>
            </select>

            <Button
              onClick={() => navigate('/cases/new')}
              className="flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">Nuevo Caso</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Cases Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 bg-gray-100 animate-pulse">
                <div className="h-full" />
              </Card>
            ))}
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCases.map((caseItem: Case) => (
              <Card key={caseItem.id} className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                <div className="space-y-3 sm:space-y-4 flex flex-col flex-1">
                  {/* Client Info */}
                  <div className="pb-2 sm:pb-3 border-b border-gray-200">
                    <button
                      onClick={() => navigate(`/clients/${caseItem.client_id}`)}
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      👤 {getClientName(caseItem.client_id)}
                    </button>
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-2">
                        {caseItem.descripcion || 'Sin descripción'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Tipo: {caseItem.tipo}</p>
                    </div>
                    <Badge variant={stateColors[caseItem.estado] || 'primary'} className="flex-shrink-0 text-xs sm:text-sm">
                      {caseItem.estado}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Inicio:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(caseItem.fecha_inicio).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {caseItem.fecha_fin && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fin:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(caseItem.fecha_fin).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 sm:flex gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetailModal(caseItem)}
                      className="flex items-center justify-center gap-1 text-xs sm:text-sm py-1.5 sm:py-2"
                      title="Ver detalles completos"
                    >
                      <span className="hidden sm:inline">📋</span>
                      <span className="sm:hidden">📋</span>
                      <span className="hidden md:inline">Detalle</span>
                      <span className="md:hidden">Det</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                      className="flex items-center justify-center gap-1 text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      <FiEdit2 size={16} className="flex-shrink-0" />
                      <span className="hidden md:inline">Editar</span>
                      <span className="md:hidden">✏️</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(caseItem.id)}
                      className="flex items-center justify-center gap-1 text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm || filterStatus ? 'No se encontraron casos' : 'No tienes casos registrados'}
            </p>
            <Button onClick={() => navigate('/cases/new')} className="flex items-center gap-2 mx-auto">
              <FiPlus size={18} />
              Crear Primer Caso
            </Button>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Casos</p>
                <p className="text-2xl font-bold text-blue-900">{casesForUser.length}</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </Card>

          <Card className="bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En Progreso</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {casesForUser.filter((c: Case) => c.estado === 'en_progreso').length}
                </p>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </Card>

          <Card className="bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cerrados</p>
                <p className="text-2xl font-bold text-green-900">
                  {casesForUser.filter((c: Case) => c.estado === 'cerrado').length}
                </p>
              </div>
              <span className="text-3xl">✓</span>
            </div>
          </Card>

          <Card className="bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Abiertos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {casesForUser.filter((c: Case) => c.estado === 'abierto').length}
                </p>
              </div>
              <span className="text-3xl">🔓</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          clientName={getClientName(selectedCase.client_id)}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onUploadClick={() => {
            setIsDetailModalOpen(false);
            handleOpenUploadModal(selectedCase);
          }}
        />
      )}



      {/* Document Upload Modal */}
      {selectedCase && (
        <DocumentUploadModal
          caseId={selectedCase.id}
          caseName={selectedCase.descripcion}
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            // Reabrir el modal de visualización para ver el documento nuevo
            setIsDetailModalOpen(true);
          }}
          onSuccess={() => {
            // El modal se cierra y reabre automáticamente
          }}
        />
      )}
    </div>
  );
};

CasesPage.displayName = 'CasesPage';
