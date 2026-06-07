import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ============================================================
// BarberCalendario — Calendario semanal del barbero
// Muestra citas de la semana en vista de calendario
// ============================================================
export default function BarberCalendario() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [loading, setLoading] = useState(true);

  // Obtener inicio de semana (lunes)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Generar días de la semana
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Cargar citas de la semana
  useEffect(() => {
    const loadWeekAppointments = async () => {
      setLoading(true);
      try {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const res = await api.appointments.getAll({
          barber: user._id,
          startDate: currentWeekStart.toISOString(),
          endDate: weekEnd.toISOString(),
        });
        setAppointments(res.data.data || []);
      } catch (error) {
        console.error('Error cargando calendario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeekAppointments();
  }, [user._id, currentWeekStart]);

  // Navegar semanas
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  // Ir a semana actual
  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  // Obtener citas de un día específico
  const getAppointmentsForDay = (date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const weekDays = getWeekDays();
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Calendario</h1>

        {/* Navegación de semana */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg bg-barber-dark hover:bg-barber-blue/20 text-barber-gray hover:text-barber-white transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>

          <button
            onClick={goToCurrentWeek}
            className="px-4 py-2 rounded-lg bg-barber-dark hover:bg-barber-blue/20 text-barber-gray hover:text-barber-white text-sm font-medium transition-colors"
          >
            Hoy
          </button>

          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg bg-barber-dark hover:bg-barber-blue/20 text-barber-gray hover:text-barber-white transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-barber-dark border-t-barber-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-barber-gray">Cargando calendario...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dayAppts = getAppointmentsForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`bg-barber-charcoal rounded-xl border min-h-[200px] ${
                  isToday ? 'border-barber-blue' : 'border-barber-dark'
                }`}
              >
                {/* Encabezado del día */}
                <div className={`p-3 border-b border-barber-dark ${isToday ? 'bg-barber-blue/10' : ''}`}>
                  <p className="text-barber-gray text-xs font-medium">{dayNames[index]}</p>
                  <p className={`text-xl font-bold ${isToday ? 'text-barber-blue' : 'text-barber-white'}`}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Citas del día */}
                <div className="p-2 space-y-1">
                  {dayAppts.length === 0 ? (
                    <p className="text-barber-dark text-xs text-center py-4">Sin citas</p>
                  ) : (
                    dayAppts.map((apt) => (
                      <div
                        key={apt._id}
                        className={`p-2 rounded-lg text-xs ${
                          apt.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : apt.status === 'cancelled'
                            ? 'bg-barber-red/10 text-barber-red'
                            : 'bg-barber-blue/10 text-barber-blue'
                        }`}
                      >
                        <p className="font-medium">{apt.time}</p>
                        <p className="opacity-75 truncate">{apt.client?.name || 'General'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
