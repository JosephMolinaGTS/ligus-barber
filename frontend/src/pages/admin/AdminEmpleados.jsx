import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ============================================================
// AdminEmpleados — CRUD de empleados/barberos
// ============================================================
export default function AdminEmpleados() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'barber',
    branch: '',
    password: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, branchRes] = await Promise.all([
        api.employees.getAll({ search, limit: 50 }),
        api.branches.getAll({ limit: 50 }),
      ]);
      setEmployees(empRes.data.data);
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
    setForm({ name: '', email: '', phone: '', role: 'barber', branch: '', password: '123456' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      role: emp.role,
      branch: emp.branch?._id || emp.branch || '',
    });
    setSelected(emp);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.employees.update(selected._id, form);
        toast.success('Empleado actualizado');
      } else {
        await api.employees.create(form);
        toast.success('Empleado creado');
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.employees.delete(selected._id);
      toast.success('Empleado eliminado');
      setConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono', render: (val) => val || '-' },
    {
      key: 'role',
      label: 'Rol',
      render: (val) => (
        <span className="capitalize">{val === 'barber' ? 'Barbero' : 'Admin'}</span>
      ),
    },
    {
      key: 'branch',
      label: 'Sucursal',
      render: (val) => val?.name || '-',
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
        <h1 className="text-barber-white text-3xl font-bold">Empleados</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus size={16} /> Nuevo Empleado
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar empleado..."
        className="w-full max-w-md bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm mb-6"
      />

      <DataTable columns={columns} data={employees} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
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
          <div>
            <label className="block text-barber-gray text-sm mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
            >
              <option value="barber">Barbero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">Sucursal</label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
              required
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
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
            {isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Empleado"
        message={`¿Estás seguro de eliminar a ${selected?.name}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
