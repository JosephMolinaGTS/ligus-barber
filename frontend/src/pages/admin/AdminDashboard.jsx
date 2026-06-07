import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import { FiCalendar, FiCheck, FiClock, FiX, FiUsers } from 'react-icons/fi';

// ============================================================
// AdminDashboard — Panel de resumen para administradores de sucursal
// Muestra métricas básicas con selector de fecha
// ============================================================
export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.appointments.getAll({ limit: 50 });
        const apts = res.data.data;

        // Filtrar por fecha seleccionada
        const filtered = apts.filter((apt) => {
          const aptDate = new Date(apt.date).toISOString().split('T')[0];
          return aptDate === selectedDate;
        });

        setAppointments(filtered.slice(0, 10));

        setStats({
          total: filtered.length,
          pending: filtered.filter((a) => a.status === 'pending').length,
          confirmed: filtered.filter((a) => a.status === 'confirmed').length,
          completed: filtered.filter((a) => a.status === 'completed').length,
          cancelled: filtered.filter((a) => a.status === 'cancelled').length,
        });
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Panel Admin</h1>
        <div className="flex items-center gap-4">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-barber-dark rounded-lg px-4 py-2">
            <FiCalendar className="text-barber-blue" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-barber-white text-sm focus:outline-none"
            />
          </div>
          <Link
            to="/admin/citas"
            className="bg-barber-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Ver Citas
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Citas" value={stats.total} icon={FiCalendar} color="blue" />
        <StatsCard title="Pendientes" value={stats.pending} icon={FiClock} color="yellow" />
        <StatsCard title="Confirmadas" value={stats.confirmed} icon={FiCheck} color="green" />
        <StatsCard title="Canceladas" value={stats.cancelled} icon={FiX} color="red" />
      </div>

      {/* Últimas citas */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        <h2 className="text-barber-white text-xl font-semibold mb-4">
          Citas del día
        </h2>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-barber-gray text-sm">No hay citas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between p-3 bg-barber-dark rounded-lg"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {apt.client?.name || 'Cliente general'} — {apt.service?.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(apt.date).toLocaleDateString('es-MX')} a las {apt.time}
                    {' · '} {apt.barber?.name}
                  </p>
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
    pending: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10' },
    confirmed: { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10' },
    completed: { label: 'Completada', color: 'text-green-400 bg-green-400/10' },
    cancelled: { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
  );
}
