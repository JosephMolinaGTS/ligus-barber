import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import { FiCalendar, FiCheck, FiClock, FiX, FiUsers } from 'react-icons/fi';

// ============================================================
// AdminDashboard — Panel de resumen para administradores de sucursal
// Muestra métricas básicas y acciones rápidas
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.appointments.getAll({ limit: 50 });
        const apts = res.data.data;
        setAppointments(apts.slice(0, 10));

        setStats({
          total: res.data.pagination.total,
          pending: apts.filter((a) => a.status === 'pending').length,
          confirmed: apts.filter((a) => a.status === 'confirmed').length,
          completed: apts.filter((a) => a.status === 'completed').length,
          cancelled: apts.filter((a) => a.status === 'cancelled').length,
        });
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <p className="text-barber-gray">Cargando panel...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Panel Admin</h1>
        <Link
          to="/admin/citas"
          className="bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Ver Citas
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Citas"
          value={stats.total}
          icon={FiCalendar}
          color="blue"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pending}
          icon={FiClock}
          color="yellow"
        />
        <StatsCard
          title="Confirmadas"
          value={stats.confirmed}
          icon={FiCheck}
          color="green"
        />
        <StatsCard
          title="Canceladas"
          value={stats.cancelled}
          icon={FiX}
          color="red"
        />
      </div>

      {/* Últimas citas */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        <h2 className="text-barber-white text-xl font-semibold mb-4">
          Últimas Citas
        </h2>
        {appointments.length === 0 ? (
          <p className="text-barber-gray text-sm">No hay citas recientes</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between p-3 bg-barber-dark rounded-lg"
              >
                <div>
                  <p className="text-barber-white text-sm font-medium">
                    {apt.client?.name} — {apt.service?.name}
                  </p>
                  <p className="text-barber-gray text-xs">
                    {new Date(apt.date).toLocaleDateString('es-AR')} a las {apt.time}
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
    pending: { label: 'Pendiente', color: 'text-yellow-500 bg-yellow-500/10' },
    confirmed: { label: 'Confirmada', color: 'text-barber-blue bg-barber-blue/10' },
    completed: { label: 'Completada', color: 'text-green-500 bg-green-500/10' },
    cancelled: { label: 'Cancelada', color: 'text-barber-red bg-barber-red/10' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
  );
}
