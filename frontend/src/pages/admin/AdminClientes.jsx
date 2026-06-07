import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ============================================================
// AdminClientes — CRUD de clientes
// ============================================================
export default function AdminClientes() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.clients.getAll({ search, limit: 50 });
      setClients(res.data.data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleCreate = () => {
    setForm({ name: '', email: '', phone: '', password: '123456' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, email: client.email, phone: client.phone || '' });
    setSelected(client);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.clients.update(selected._id, form);
        toast.success('Cliente actualizado');
      } else {
        await api.clients.create(form);
        toast.success('Cliente creado');
      }
      setModalOpen(false);
      loadClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.clients.delete(selected._id);
      toast.success('Cliente eliminado');
      setConfirmOpen(false);
      loadClients();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono', render: (val) => val || '-' },
    {
      key: 'appointmentCount',
      label: 'Citas',
      render: (val) => val || 0,
    },
    {
      key: 'createdAt',
      label: 'Registro',
      render: (val) => new Date(val).toLocaleDateString('es-MX'),
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
        <h1 className="text-barber-white text-3xl font-bold">Clientes</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus size={16} /> Nuevo Cliente
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente..."
        className="w-full max-w-md bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm mb-6"
      />

      <DataTable columns={columns} data={clients} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
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
            <label className="block text-barber-gray text-sm mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            />
          </div>
          {!isEditing && (
            <div>
              <label className="block text-barber-gray text-sm mb-1">
                Contraseña (default: 123456)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-2 rounded-lg text-sm font-medium"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar a ${selected?.name}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
