import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

// ============================================================
// AdminCitas — Gestión de citas para admin
// Listar, filtrar, editar estado, cancelar
// ============================================================
export default function AdminCitas() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.appointments.getAll(params);
      setAppointments(res.data.data);
    } catch (error) {
      toast.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        await api.appointments.cancel(id);
      } else {
        await api.appointments.update(id, { status: newStatus });
      }
      toast.success('Estado actualizado');
      loadAppointments();
      setModalOpen(false);
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const columns = [
    {
      key: 'client',
      label: 'Cliente',
      render: (_, row) => row.client?.name || '-',
    },
    {
      key: 'service',
      label: 'Servicio',
      render: (_, row) => row.service?.name || '-',
    },
    {
      key: 'barber',
      label: 'Barbero',
      render: (_, row) => row.barber?.name || '-',
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (val) => new Date(val).toLocaleDateString('es-AR'),
    },
    { key: 'time', label: 'Hora' },
    {
      key: 'status',
      label: 'Estado',
      render: (val) => {
        const config = {
          pending: 'text-yellow-500',
          confirmed: 'text-barber-blue',
          completed: 'text-green-500',
          cancelled: 'text-barber-red',
        };
        const labels = {
          pending: 'Pendiente',
          confirmed: 'Confirmada',
          completed: 'Completada',
          cancelled: 'Cancelada',
        };
        return (
          <span className={config[val]}>
            {labels[val] || val}
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Precio',
      render: (val) => `$${val}`,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelected(row);
            setModalOpen(true);
          }}
          className="text-barber-blue hover:text-barber-blue-light text-sm"
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-barber-white text-3xl font-bold mb-6">Gestión de Citas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
        />
      </div>

      {/* Tabla */}
      <DataTable columns={columns} data={appointments} loading={loading} />

      {/* Modal de edición */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Estado de Cita"
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-barber-gray text-sm">
              {selected.client?.name} — {selected.service?.name}
            </p>
            <div className="space-y-2">
              {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(selected._id, status)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    selected.status === status
                      ? 'bg-barber-blue/20 text-barber-blue border border-barber-blue'
                      : 'bg-barber-dark text-barber-gray hover:text-barber-white'
                  }`}
                >
                  {{ pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' }[status]}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
