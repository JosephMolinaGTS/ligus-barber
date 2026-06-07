import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiCalendar } from 'react-icons/fi';

// ============================================================
// BarberHistorial — Historial de citas del barbero
// Lista de citas pasadas con búsqueda y filtros
// ============================================================
export default function BarberHistorial() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Cargar historial
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.appointments.getAll({ barber: user._id, status: 'completed' });
        setAppointments(res.data.data || []);
        setFilteredAppointments(res.data.data || []);
      } catch (error) {
        console.error('Error cargando historial:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user._id]);

  // Filtrar por búsqueda y fechas
  useEffect(() => {
    let result = [...appointments];

    // Filtro por texto
    if (searchTerm) {
      result = result.filter(
        (apt) =>
          apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por rango de fechas
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      result = result.filter((apt) => new Date(apt.date) >= startDate);
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59);
      result = result.filter((apt) => new Date(apt.date) <= endDate);
    }

    // Ordenar por fecha más reciente
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAppointments(result);
  }, [searchTerm, dateFilter, appointments]);

  // Calcular totales
  const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-barber-white text-3xl font-bold">Historial</h1>
        <span className="text-barber-gray text-sm">
          {filteredAppointments.length} citas
        </span>
      </div>

      {/* Filtros */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-barber-gray" size={16} />
            <input
              type="text"
              placeholder="Buscar por cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-barber-dark border border-barber-dark rounded-lg text-barber-white placeholder-barber-gray focus:outline-none focus:border-barber-blue"
            />
          </div>

          {/* Filtro fecha inicio */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-barber-gray" size={16} />
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="pl-10 pr-4 py-2 bg-barber-dark border border-barber-dark rounded-lg text-barber-white focus:outline-none focus:border-barber-blue"
            />
          </div>

          {/* Filtro fecha fin */}
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-barber-gray" size={16} />
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="pl-10 pr-4 py-2 bg-barber-dark border border-barber-dark rounded-lg text-barber-white focus:outline-none focus:border-barber-blue"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="flex gap-6 mt-4 text-sm">
          <span className="text-barber-gray">
            Total: <span className="text-barber-white font-medium">{filteredAppointments.length} citas</span>
          </span>
          <span className="text-barber-gray">
            Ingresos: <span className="text-barber-blue font-medium">${totalRevenue}</span>
          </span>
        </div>
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-barber-dark border-t-barber-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-barber-gray">Cargando historial...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="mx-auto text-barber-dark mb-3" size={48} />
          <p className="text-barber-gray">No hay citas en el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-barber-charcoal rounded-xl border border-barber-dark p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-barber-blue font-bold">{apt.time}</p>
                  <p className="text-barber-gray text-xs">
                    {new Date(apt.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-barber-white font-medium">{apt.client?.name || 'Cliente general'}</p>
                  <p className="text-barber-gray text-sm">{apt.service?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-barber-blue font-medium">${apt.price}</p>
                <p className="text-green-500 text-xs">Completada</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
