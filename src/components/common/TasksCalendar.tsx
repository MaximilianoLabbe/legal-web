import React, { useState, useMemo } from 'react';
import { Card, Badge } from '../ui';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Task } from '../../types';

interface TasksCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export const TasksCalendar: React.FC<TasksCalendarProps> = ({
  tasks,
  onTaskClick,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get tasks grouped by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const date = new Date(task.fecha_vencimiento).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    return grouped;
  }, [tasks]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

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

  const getStatusBg = (estado: string) => {
    switch (estado) {
      case 'completed':
        return 'bg-green-50';
      case 'in_progress':
        return 'bg-blue-50';
      case 'cancelled':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const monthName = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Mes anterior"
        >
          <FiChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-gray-900 capitalize">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Próximo mes"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded" />
        ))}

        {/* Days of month */}
        {days.map((day) => {
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={day}
              onClick={() => onDateClick?.(date)}
              className={`aspect-square p-1 rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                isToday
                  ? 'border-blue-500 bg-blue-50'
                  : dayTasks.length > 0
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-semibold text-gray-700 mb-0.5">{day}</div>
              <div className="space-y-0.5 overflow-y-auto max-h-[50px]">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                    className={`text-xs px-1.5 py-0.5 rounded cursor-pointer truncate ${getPriorityColor(
                      task.prioridad
                    )} hover:opacity-80`}
                    title={task.titulo}
                  >
                    {task.titulo.substring(0, 10)}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-gray-500 px-1.5 font-semibold">
                    +{dayTasks.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tasks summary */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Próximas tareas</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {tasks
              .sort(
                (a, b) =>
                  new Date(a.fecha_vencimiento).getTime() -
                  new Date(b.fecha_vencimiento).getTime()
              )
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={`p-2 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition ${getStatusBg(
                    task.estado
                  )}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(task.fecha_vencimiento).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge
                      variant="primary"
                      className={getPriorityColor(task.prioridad)}
                    >
                      {task.prioridad}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">No hay tareas para mostrar</p>
        </div>
      )}
    </Card>
  );
};
