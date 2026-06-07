import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiCheck, FiClock, FiX, FiUser, FiScissors } from 'react-icons/fi';

// ============================================================
// BarberDashboard — Panel principal del barbero
// Muestra todas las citas asignadas con info completa
// ============================================================
export default function BarberDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.appointments.getAll({ barber: user._id });
        const apts = res.data.data || [];

        setAppointments(apts);
        setStats({
          total: apts.length,
          pending: apts.filter((a) => a.status === 'pending').length,
          confirmed: apts.filter((a) => a.status === 'confirmed').length,
          completed: apts.filter((a) => a.status === 'completed').length,
          cancelled: apts.filter((a) => a.status === 'cancelled').length,
        });
      } catch (error) {
        console.error('Error cargando panel del barbero:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user._id]);

  // Filtrar citas
  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((apt) => apt.status === filter);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-bold">Mi Panel</h1>
        <span className="text-gray-400 text-sm">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Total" value={stats.total} icon={FiCalendar} color="blue" />
        <StatsCard title="Pendientes" value={stats.pending} icon={FiClock} color="yellow" />
        <StatsCard title="Confirmadas" value={stats.confirmed} icon={FiCheck} color="green" />
        <StatsCard title="Completadas" value={stats.completed} icon={FiCheck} color="green" />
        <StatsCard title="Canceladas" value={stats.cancelled} icon={FiX} color="red" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'completed', label: 'Completadas' },
          { key: 'cancelled', label: 'Canceladas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="mx-auto text-gray-600 mb-3" size={48} />
          <p className="text-gray-400">No hay citas {filter !== 'all' ? 'con este estado' : 'asignadas'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-gray-800 rounded-xl border border-gray-700 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info de la cita */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-center min-w-[60px]">
                      <p className="text-blue-400 font-bold text-lg">{apt.time}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(apt.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-600" />
                    <div>
                      <p className="text-white font-medium">{apt.service?.name}</p>
                      <p className="text-gray-400 text-sm">${apt.price} · {apt.service?.duration} min</p>
                    </div>
                  </div>

                  {/* Datos del cliente */}
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <FiUser className="text-gray-500" size={14} />
                    <span className="text-gray-300">
                      {apt.client?.name || apt.guestName || 'Cliente general'}
                    </span>
                    {(apt.client?.phone || apt.guestPhone) && (
                      <span className="text-gray-500">
                        · {apt.client?.phone || apt.guestPhone}
                      </span>
                    )}
                  </div>

                  {/* Observaciones */}
                  {apt.observations && (
                    <p className="text-gray-500 text-xs mt-2 italic">
                      "{apt.observations}"
                    </p>
                  )}
                </div>

                {/* Estado */}
                <StatusBadge status={apt.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10' },
    confirmed: { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10' },
    completed: { label: 'Completada', color: 'text-green-400 bg-green-400/10' },
    cancelled: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
