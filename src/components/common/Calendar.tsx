import React, { useState } from 'react';
import { Badge } from '../ui';

interface Meeting {
  id: string;
  date: Date;
  title: string;
  time: string;
  client?: string;
  type: 'reunion' | 'audiencia' | 'entrega' | 'otro';
}

interface CalendarProps {
  meetings?: Meeting[];
  onDateClick?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ meetings = [], onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getMeetingsForDay = (day: number | null) => {
    if (!day) return [];
    // Create date string in format YYYY-MM-DD for comparison (ignoring timezone)
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDate = `${year}-${month}-${dayStr}`;
    
    return meetings.filter(m => {
      // Extract date part from meeting date (also YYYY-MM-DD format)
      const meetingDate = m.date.toISOString().split('T')[0];
      return meetingDate === targetDate;
    });
  };

  const typeColors = {
    reunion: 'primary',
    audiencia: 'warning',
    entrega: 'success',
    otro: 'info'
  } as const;

  const typeLabels = {
    reunion: 'Reunión',
    audiencia: 'Audiencia',
    entrega: 'Entrega',
    otro: 'Otro'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            ←
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayMeetings = getMeetingsForDay(day);
          const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
          
          return (
            <div
              key={index}
              onClick={() => {
                if (day && dayDate && onDateClick) {
                  onDateClick(dayDate);
                }
              }}
              className={`min-h-24 p-2 rounded-lg border transition-colors cursor-pointer ${
                day === null
                  ? 'bg-gray-50 border-transparent cursor-default'
                  : day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear()
                  ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{day}</p>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map(meeting => (
                      <div key={meeting.id} className="text-xs">
                        <Badge variant={typeColors[meeting.type]} className="w-full text-center">
                          {meeting.time}
                        </Badge>
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{dayMeetings.length - 2} más
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming meetings */}
      {meetings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Próximas Reuniones</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {meetings
              .filter(m => m.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map(meeting => (
                <div
                  key={meeting.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{meeting.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {meeting.date.toLocaleDateString('es-ES')} a las {meeting.time}
                      </p>
                      {meeting.client && (
                        <p className="text-xs text-gray-500 mt-1">Cliente: {meeting.client}</p>
                      )}
                    </div>
                    <Badge variant={typeColors[meeting.type]} className="text-xs">
                      {typeLabels[meeting.type]}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

Calendar.displayName = 'Calendar';
