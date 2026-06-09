import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatPhone } from '../../utils/format';

// ============================================================
// AdminSucursales — CRUD de sucursales
// Solo el dueño puede crear/editar/eliminar
// ============================================================
export default function AdminSucursales() {
  const { isOwner } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    schedule: { open: '09:00', close: '20:00', days: [1, 2, 3, 4, 5, 6] },
  });

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await api.branches.getAll({ limit: 50 });
      setBranches(res.data.data);
    } catch (error) {
      toast.error('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = () => {
    setForm({
      name: '', address: '', phone: '',
      schedule: { open: '09:00', close: '20:00', days: [1, 2, 3, 4, 5, 6] },
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (branch) => {
    setForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      schedule: branch.schedule || { open: '09:00', close: '20:00', days: [1, 2, 3, 4, 5, 6] },
    });
    setSelected(branch);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.branches.update(selected._id, form);
        toast.success('Sucursal actualizada');
      } else {
        await api.branches.create(form);
        toast.success('Sucursal creada');
      }
      setModalOpen(false);
      loadBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.branches.delete(selected._id);
      toast.success('Sucursal eliminada');
      setConfirmOpen(false);
      loadBranches();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter((d) => d !== day)
          : [...prev.schedule.days, day],
      },
    }));
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone', label: 'Teléfono', render: (val) => formatPhone(val) },
    {
      key: 'schedule',
      label: 'Horario',
      render: (val) =>
        val ? `${val.open} - ${val.close}` : '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (val) => (
        <span className={val ? 'text-green-500' : 'text-barber-red'}>
          {val ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    ...(isOwner
      ? [
          {
            key: 'actions',
            label: 'Acciones',
            render: (_, row) => (
              <div className="flex gap-2">
                <button onClick={() => handleEdit(row)} className="text-barber-blue hover:text-barber-blue-light">
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelected(row);
                    setConfirmOpen(true);
                  }}
                  className="text-barber-red hover:text-barber-red-dark"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-barber-white text-3xl font-bold">Sucursales</h1>
        {isOwner && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FiPlus size={16} /> Nueva Sucursal
          </button>
        )}
      </div>

      <DataTable columns={columns} data={branches} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-barber-gray text-sm mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-barber-gray text-sm mb-1">Apertura</label>
              <input
                type="time"
                value={form.schedule.open}
                onChange={(e) =>
                  setForm({
                    ...form,
                    schedule: { ...form.schedule, open: e.target.value },
                  })
                }
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              />
            </div>
            <div>
              <label className="block text-barber-gray text-sm mb-1">Cierre</label>
              <input
                type="time"
                value={form.schedule.close}
                onChange={(e) =>
                  setForm({
                    ...form,
                    schedule: { ...form.schedule, close: e.target.value },
                  })
                }
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-2">
              Días de atención
            </label>
            <div className="flex gap-2">
              {dayNames.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    form.schedule.days.includes(idx)
                      ? 'bg-barber-blue text-white'
                      : 'bg-barber-dark text-barber-gray'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-2 rounded-lg text-sm font-medium"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Sucursal'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Sucursal"
        message={`¿Estás seguro de eliminar "${selected?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
