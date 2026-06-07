import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

// ============================================================
// MisCitas — Listado de citas del usuario actual
// Filtrable por estado, con opción de cancelar
// ============================================================
export default function MisCitas() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'text-yellow-500 bg-yellow-500/10' },
    confirmed: { label: 'Confirmada', color: 'text-barber-blue bg-barber-blue/10' },
    completed: { label: 'Completada', color: 'text-green-500 bg-green-500/10' },
    cancelled: { label: 'Cancelada', color: 'text-barber-red bg-barber-red/10' },
  };

  const loadAppointments = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.appointments.getMine(params);
      setAppointments(res.data.data);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const handleCancel = async (id) => {
    try {
      await api.appointments.cancel(id);
      toast.success('Cita cancelada');
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-barber-white text-4xl font-bold mb-8">Mis Citas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: '', label: 'Todas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'confirmed', label: 'Confirmadas' },
          { value: 'completed', label: 'Completadas' },
          { value: 'cancelled', label: 'Canceladas' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-barber-blue text-white'
                : 'bg-barber-charcoal border border-barber-dark text-barber-gray hover:text-barber-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de citas */}
      {loading ? (
        <p className="text-barber-gray text-center">Cargando citas...</p>
      ) : appointments.length === 0 ? (
        <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-8 text-center">
          <p className="text-barber-gray">No tenés citas{filter ? ' con ese estado' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const status = statusConfig[apt.status];
            return (
              <div
                key={apt._id}
                className="bg-barber-charcoal rounded-xl border border-barber-dark p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-barber-white font-semibold">
                      {apt.service?.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="text-barber-gray text-sm space-y-1">
                    <p>📅 {new Date(apt.date).toLocaleDateString('es-AR')}</p>
                    <p>🕐 {apt.time}</p>
                    <p>✂️ {apt.barber?.name}</p>
                    <p>📍 {apt.branch?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-barber-blue font-bold text-lg">
                    ${apt.price}
                  </span>
                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="text-barber-red hover:text-barber-red-dark p-2"
                      title="Cancelar cita"
                    >
                      <FiX size={18} />
                    </button>
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
