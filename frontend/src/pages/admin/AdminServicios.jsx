import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ============================================================
// AdminServicios — CRUD de servicios
// ============================================================
export default function AdminServicios() {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    branches: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [svcRes, branchRes] = await Promise.all([
        api.services.getAll({ search, limit: 50 }),
        api.branches.getAll({ limit: 50 }),
      ]);
      setServices(svcRes.data.data);
      setBranches(branchRes.data.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreate = () => {
    setForm({ name: '', description: '', price: '', duration: '', branches: [] });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (svc) => {
    setForm({
      name: svc.name,
      description: svc.description || '',
      price: svc.price,
      duration: svc.duration,
      branches: svc.branches?.map((b) => b._id || b) || [],
    });
    setSelected(svc);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.services.update(selected._id, form);
        toast.success('Servicio actualizado');
      } else {
        await api.services.create(form);
        toast.success('Servicio creado');
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.services.delete(selected._id);
      toast.success('Servicio eliminado');
      setConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const toggleBranch = (branchId) => {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter((id) => id !== branchId)
        : [...prev.branches, branchId],
    }));
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'price',
      label: 'Precio',
      render: (val) => `$${val}`,
    },
    {
      key: 'duration',
      label: 'Duración',
      render: (val) => `${val} min`,
    },
    {
      key: 'branches',
      label: 'Sucursales',
      render: (val) => val?.map((b) => b.name || b).join(', ') || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (val) => (
        <span className={val ? 'text-green-500' : 'text-barber-red'}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
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
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-barber-white text-3xl font-bold">Servicios</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus size={16} /> Nuevo Servicio
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar servicio..."
        className="w-full max-w-md bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm mb-6"
      />

      <DataTable columns={columns} data={services} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="lg"
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
            <label className="block text-barber-gray text-sm mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-barber-gray text-sm mb-1">Precio ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-barber-gray text-sm mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
                required
                min="5"
              />
            </div>
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-2">Sucursales</label>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => toggleBranch(b._id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    form.branches.includes(b._id)
                      ? 'bg-barber-blue text-white'
                      : 'bg-barber-dark text-barber-gray hover:text-barber-white'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-2 rounded-lg text-sm font-medium"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Servicio"
        message={`¿Estás seguro de eliminar "${selected?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
