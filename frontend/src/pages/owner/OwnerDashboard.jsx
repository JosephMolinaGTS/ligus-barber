import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  FiCalendar, FiCheck, FiX, FiDollarSign, FiUsers, FiScissors,
} from 'react-icons/fi';

// ============================================================
// OwnerDashboard — Dashboard exclusivo del dueño
// Métricas, gráficas, tablas de rendimiento
// ============================================================
export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.dashboard.getStats({ period });
        setData(res.data.data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [period]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-barber-dark border-t-barber-blue rounded-full animate-spin mx-auto mb-4" />
        <p className="text-barber-gray">Cargando métricas...</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-barber-gray text-center">Error al cargar datos</p>;
  }

  const { summary, topServices, topBarbers, topBranches, chartData, recentAppointments } = data;

  // Colores para gráficas
  const COLORS = ['#004B7A', '#00517F', '#9B0000', '#CFCFCF', '#2B2B2B'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Dashboard Dueño</h1>

        {/* Selector de período */}
        <div className="flex gap-2">
          {['day', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-barber-blue text-white'
                  : 'bg-barber-charcoal border border-barber-dark text-barber-gray hover:text-barber-white'
              }`}
            >
              {{ day: 'Día', month: 'Mes', year: 'Año' }[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard title="Total Citas" value={summary.totalAppointments} icon={FiCalendar} color="blue" />
        <StatsCard title="Completadas" value={summary.completedAppointments} icon={FiCheck} color="green" />
        <StatsCard title="Canceladas" value={summary.cancelledAppointments} icon={FiX} color="red" />
        <StatsCard title="Pendientes" value={summary.pendingAppointments} icon={FiCalendar} color="yellow" />
        <StatsCard title="Ingresos" value={`$${summary.totalRevenue}`} icon={FiDollarSign} color="blue" />
        <StatsCard title="Clientes" value={summary.totalClients} icon={FiUsers} color="white" />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfica de barras: Citas por mes */}
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
          <h3 className="text-barber-white font-semibold mb-4">Citas por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
              <XAxis dataKey="name" stroke="#CFCFCF" fontSize={12} />
              <YAxis stroke="#CFCFCF" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1A1A1A', border: '1px solid #2B2B2B', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
              <Bar dataKey="citas" fill="#004B7A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica circular: Distribución de servicios */}
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
          <h3 className="text-barber-white font-semibold mb-4">
            Servicios Más Solicitados
          </h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topServices}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {topServices.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2B2B2B', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-barber-gray text-center py-8">Sin datos</p>
          )}
        </div>
      </div>

      {/* Gráfica de línea: Ingresos por mes */}
      {chartData.length > 0 && (
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6 mb-8">
          <h3 className="text-barber-white font-semibold mb-4">Ingresos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
              <XAxis dataKey="name" stroke="#CFCFCF" fontSize={12} />
              <YAxis stroke="#CFCFCF" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1A1A1A', border: '1px solid #2B2B2B', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#004B7A" strokeWidth={2} dot={{ fill: '#004B7A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tablas de ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top barberos */}
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
          <h3 className="text-barber-white font-semibold mb-4 flex items-center gap-2">
            <FiScissors className="text-barber-blue" />
            Barberos con Más Citas
          </h3>
          {topBarbers.length > 0 ? (
            <div className="space-y-3">
              {topBarbers.map((barber, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-barber-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-barber-blue font-bold text-lg">#{idx + 1}</span>
                    <span className="text-barber-white">{barber.name}</span>
                  </div>
                  <span className="text-barber-gray text-sm">{barber.count} citas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-barber-gray text-sm">Sin datos</p>
          )}
        </div>

        {/* Top sucursales */}
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
          <h3 className="text-barber-white font-semibold mb-4">
            Sucursales con Mejor Rendimiento
          </h3>
          {topBranches.length > 0 ? (
            <div className="space-y-3">
              {topBranches.map((branch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-barber-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-barber-blue font-bold text-lg">#{idx + 1}</span>
                    <span className="text-barber-white">{branch.name}</span>
                  </div>
                  <span className="text-barber-gray text-sm">{branch.count} citas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-barber-gray text-sm">Sin datos</p>
          )}
        </div>
      </div>

      {/* Tabla de últimos movimientos */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        <h3 className="text-barber-white font-semibold mb-4">Últimos Movimientos</h3>
        {recentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-barber-dark">
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Cliente</th>
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Servicio</th>
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Barbero</th>
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Fecha</th>
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Estado</th>
                  <th className="text-left text-xs text-barber-gray uppercase px-4 py-2">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-barber-dark">
                {recentAppointments.map((apt) => {
                  const statusColors = {
                    pending: 'text-yellow-500',
                    confirmed: 'text-barber-blue',
                    completed: 'text-green-500',
                    cancelled: 'text-barber-red',
                  };
                  const statusLabels = {
                    pending: 'Pendiente',
                    confirmed: 'Confirmada',
                    completed: 'Completada',
                    cancelled: 'Cancelada',
                  };
                  return (
                    <tr key={apt._id} className="hover:bg-barber-dark/50">
                      <td className="px-4 py-3 text-sm text-barber-white">{apt.client?.name}</td>
                      <td className="px-4 py-3 text-sm text-barber-white">{apt.service?.name}</td>
                      <td className="px-4 py-3 text-sm text-barber-white">{apt.barber?.name}</td>
                      <td className="px-4 py-3 text-sm text-barber-gray">
                        {new Date(apt.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className={`px-4 py-3 text-sm ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </td>
                      <td className="px-4 py-3 text-sm text-barber-blue font-medium">${apt.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-barber-gray text-sm">Sin movimientos recientes</p>
        )}
      </div>
    </div>
  );
}
