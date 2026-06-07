import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ============================================================
// AdminProductos — CRUD de productos
// ============================================================
export default function AdminProductos() {
  const [products, setProducts] = useState([]);
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
    category: 'otros',
    stock: 0,
    branch: '',
    isPromoted: false,
  });

  const categories = [
    'pomadas', 'ceras', 'shampoo', 'aceites', 'after-shave', 'peines', 'kits', 'otros',
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, branchRes] = await Promise.all([
        api.products.getAll({ search, limit: 50 }),
        api.branches.getAll({ limit: 50 }),
      ]);
      setProducts(prodRes.data.data);
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
    setForm({
      name: '', description: '', price: '', category: 'otros',
      stock: 0, branch: '', isPromoted: false,
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEdit = (prod) => {
    setForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      category: prod.category,
      stock: prod.stock,
      branch: prod.branch?._id || prod.branch || '',
      isPromoted: prod.isPromoted,
    });
    setSelected(prod);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.products.update(selected._id, form);
        toast.success('Producto actualizado');
      } else {
        await api.products.create(form);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.products.delete(selected._id);
      toast.success('Producto eliminado');
      setConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'price',
      label: 'Precio',
      render: (val) => `$${val}`,
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (val) => <span className="capitalize">{val}</span>,
    },
    { key: 'stock', label: 'Stock' },
    {
      key: 'branch',
      label: 'Sucursal',
      render: (val) => val?.name || '-',
    },
    {
      key: 'isPromoted',
      label: 'Promo',
      render: (val) => (
        <span className={val ? 'text-barber-blue' : 'text-barber-gray'}>
          {val ? '★' : '-'}
        </span>
      ),
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
        <h1 className="text-barber-white text-3xl font-bold">Productos</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus size={16} /> Nuevo Producto
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full max-w-md bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm mb-6"
      />

      <DataTable columns={columns} data={products} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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
              <label className="block text-barber-gray text-sm mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm"
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-barber-gray text-sm mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-2 text-barber-white text-sm capitalize"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
                <option value="">Seleccionar</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-barber-gray text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPromoted}
              onChange={(e) => setForm({ ...form, isPromoted: e.target.checked })}
              className="rounded border-barber-dark"
            />
            Producto promocionado (aparece en landing)
          </label>
          <button
            type="submit"
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-2 rounded-lg text-sm font-medium"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${selected?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
