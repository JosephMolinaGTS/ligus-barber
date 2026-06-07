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
// Filtros: Día específico, Mes específico, Año completo
// ============================================================
export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterType, setFilterType] = useState('month'); // 'day', 'month', 'year'
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const params = { period: filterType };

        if (filterType === 'day') {
          params.date = selectedDay;
        } else if (filterType === 'month') {
          params.date = selectedMonth;
        } else if (filterType === 'year') {
          params.date = selectedYear;
        }

        const res = await api.dashboard.getStats(params);
        setData(res.data.data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [filterType, selectedDay, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando métricas...</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-400 text-center">Error al cargar datos</p>;
  }

  const { summary, topServices, topBarbers, topBranches, chartData, recentAppointments } = data;

  // Colores para gráficas (más vivos)
  const COLORS = ['#3B82F6', '#22C55E', '#EF4444', '#EAB308', '#A855F7'];

  // Obtener fecha legible
  const getDateLabel = () => {
    if (filterType === 'day') {
      return new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
    } else {
      return `Año ${selectedYear}`;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold">Dashboard Dueño</h1>
          <p className="text-gray-400 text-sm mt-1">{getDateLabel()}</p>
        </div>

        {/* Selector de tipo de filtro */}
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          {[
            { key: 'day', label: 'Día' },
            { key: 'month', label: 'Mes' },
            { key: 'year', label: 'Año' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === f.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de fecha específico */}
      <div className="mb-6">
        {filterType === 'day' && (
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 inline-flex">
            <FiCalendar className="text-blue-400" size={16} />
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none"
            />
          </div>
        )}

        {filterType === 'month' && (
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 inline-flex">
            <FiCalendar className="text-blue-400" size={16} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none"
            />
          </div>
        )}

        {filterType === 'year' && (
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 inline-flex">
            <FiCalendar className="text-blue-400" size={16} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year} className="bg-gray-800">
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4">Citas por Período</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
              <Bar dataKey="citas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica circular: Distribución de servicios */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4">
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
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos</p>
          )}
        </div>
      </div>

      {/* Gráfica de línea: Ingresos por mes */}
      {chartData.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Ingresos por Período</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#FFF' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tablas de ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top barberos */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiScissors className="text-blue-400" />
            Barberos con Más Citas
          </h3>
          {topBarbers.length > 0 ? (
            <div className="space-y-3">
              {topBarbers.map((barber, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold text-lg">#{idx + 1}</span>
                    <span className="text-white">{barber.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{barber.count} citas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>

        {/* Top sucursales */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-4">
            Sucursales con Mejor Rendimiento
          </h3>
          {topBranches.length > 0 ? (
            <div className="space-y-3">
              {topBranches.map((branch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold text-lg">#{idx + 1}</span>
                    <span className="text-white">{branch.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{branch.count} citas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>
      </div>

      {/* Tabla de últimos movimientos */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4">Últimos Movimientos</h3>
        {recentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Cliente</th>
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Servicio</th>
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Barbero</th>
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Fecha</th>
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Estado</th>
                  <th className="text-left text-xs text-gray-400 uppercase px-4 py-2">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentAppointments.map((apt) => {
                  const statusColors = {
                    pending: 'text-yellow-400',
                    confirmed: 'text-blue-400',
                    completed: 'text-green-400',
                    cancelled: 'text-red-400',
                  };
                  const statusLabels = {
                    pending: 'Pendiente',
                    confirmed: 'Confirmada',
                    completed: 'Completada',
                    cancelled: 'Cancelada',
                  };
                  return (
                    <tr key={apt._id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-white">{apt.client?.name}</td>
                      <td className="px-4 py-3 text-sm text-white">{apt.service?.name}</td>
                      <td className="px-4 py-3 text-sm text-white">{apt.barber?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(apt.date).toLocaleDateString('es-MX')}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-400 font-medium">${apt.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin movimientos recientes</p>
        )}
      </div>
    </div>
  );
}
