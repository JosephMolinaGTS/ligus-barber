import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiCheck, FiClock, FiX } from 'react-icons/fi';

// ============================================================
// BarberDashboard — Panel principal del barbero
// Muestra citas del día y estadísticas resumen
// ============================================================
export default function BarberDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await api.appointments.getAll({ barber: user._id, date: today });
        const apts = res.data.data || [];

        setAppointments(apts);
        setStats({
          total: apts.length,
          pending: apts.filter((a) => a.status === 'pending').length,
          confirmed: apts.filter((a) => a.status === 'confirmed').length,
          completed: apts.filter((a) => a.status === 'completed').length,
        });
      } catch (error) {
        console.error('Error cargando dashboard del barbero:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user._id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-barber-dark border-t-barber-blue rounded-full animate-spin mx-auto mb-4" />
        <p className="text-barber-gray">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Mi Panel</h1>
        <span className="text-barber-gray text-sm">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Hoy" value={stats.total} icon={FiCalendar} color="blue" />
        <StatsCard title="Pendientes" value={stats.pending} icon={FiClock} color="yellow" />
        <StatsCard title="Confirmadas" value={stats.confirmed} icon={FiCheck} color="green" />
        <StatsCard title="Completadas" value={stats.completed} icon={FiCheck} color="green" />
      </div>

      {/* Lista de citas del día */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        <h2 className="text-barber-white text-xl font-semibold mb-4">
          Citas de Hoy
        </h2>

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto text-barber-dark mb-3" size={48} />
            <p className="text-barber-gray">No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between p-4 bg-barber-dark rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-barber-blue font-bold text-lg">{apt.time}</p>
                  </div>
                  <div>
                    <p className="text-barber-white font-medium">
                      {apt.client?.name || 'Cliente general'}
                    </p>
                    <p className="text-barber-gray text-sm">
                      {apt.service?.name}
                    </p>
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pendiente', color: 'text-yellow-500 bg-yellow-500/10' },
    confirmed: { label: 'Confirmada', color: 'text-barber-blue bg-barber-blue/10' },
    completed: { label: 'Completada', color: 'text-green-500 bg-green-500/10' },
    cancelled: { label: 'Cancelada', color: 'text-barber-red bg-barber-red/10' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
