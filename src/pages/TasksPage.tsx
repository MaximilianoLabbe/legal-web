import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout';
import { Card, Button, Badge, Alert } from '../components/ui';
import { TaskModalForm } from '../components/common/TaskModalForm';
import { TasksCalendar } from '../components/common/TasksCalendar';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/index';
import { useCaseStore } from '../store/caseStore';
import { useAuthStore } from '../store/authStore';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiClock, FiX } from 'react-icons/fi';
import type { Task, TaskStatus } from '../types';

export const TasksPage: React.FC = () => {
  const { user } = useAuthStore();
  const { myTasks, isLoading, error, fetchMyTasks, fetchAllTasks, updateTaskStatus, deleteTask, createTask, updateTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const { cases, fetchCases } = useCaseStore();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        user?.role === 'admin' ? fetchAllTasks() : fetchMyTasks(),
        fetchUsers(),
        user?.id ? (user.role === 'admin' ? fetchCases() : fetchCases(user.id)) : null,
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTaskStatus(task.id, status);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Filter tasks
  const filteredTasks = myTasks.filter((task) => {
    if (filter === 'all') return true;
    return task.estado === filter;
  });

  // Get user name
  const getUserName = (userId: string) => {
    const u = users.find((usr) => usr.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'Usuario desconocido';
  };

  const getStatusIcon = (estado: TaskStatus) => {
    switch (estado) {
      case 'completed':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <FiClock className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <FiX className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStatusColor = (estado: TaskStatus) => {
    switch (estado) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Mis Tareas" subtitle="Gestiona tus tareas asignadas" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && <Alert type="error" message={error} />}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <FiPlus size={18} />
            <span className="hidden sm:inline">Nueva Tarea</span>
            <span className="sm:hidden">Nueva</span>
          </Button>

          {/* View Toggle */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant={view === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="text-xs sm:text-sm"
            >
              Lista
            </Button>
            <Button
              variant={view === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="text-xs sm:text-sm"
            >
              Calendario
            </Button>
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'pending', 'in_progress', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {f === 'all' && 'Todas'}
                  {f === 'pending' && 'Pendientes'}
                  {f === 'in_progress' && 'En progreso'}
                  {f === 'completed' && 'Completadas'}
                </button>
              ))}
            </div>

            {/* Tasks List */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando tareas...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 mb-4">No hay tareas en este estado</p>
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  variant="primary"
                >
                  Crear primera tarea
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 sm:p-4 hover:shadow-md transition"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Status indicator */}
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(task.estado)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {task.titulo}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.descripcion}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge
                              variant="primary"
                              className={`text-xs ${getPriorityColor(task.prioridad)}`}
                            >
                              {task.prioridad}
                            </Badge>
                            <Badge
                              variant="primary"
                              className={`text-xs ${getStatusColor(task.estado)}`}
                            >
                              {task.estado}
                            </Badge>
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            Vence:{' '}
                            <span
                              className={
                                isOverdue(task.fecha_vencimiento)
                                  ? 'text-red-600 font-semibold'
                                  : ''
                              }
                            >
                              {new Date(task.fecha_vencimiento).toLocaleDateString(
                                'es-ES'
                              )}
                            </span>
                          </span>
                          <span>Asignado a: {getUserName(task.assigned_to_id)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="flex gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.estado !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task, 'completed')}
                            className="p-2 hover:bg-green-100 rounded-lg transition text-green-600"
                            title="Marcar como completada"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(task)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <TasksCalendar
            tasks={filteredTasks}
          />
        )}
      </div>

      {/* Task Modal */}
      <TaskModalForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        users={users}
        cases={cases}
        initialData={editingTask}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      />
    </div>
  );
};
