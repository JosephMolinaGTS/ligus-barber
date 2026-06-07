import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

// ============================================================
// Productos — Catálogo público de productos
// Filtros por categoría, sucursal y búsqueda
// ============================================================
export default function Productos() {
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'pomadas', label: 'Pomadas' },
    { value: 'ceras', label: 'Ceras' },
    { value: 'shampoo', label: 'Shampoo' },
    { value: 'aceites', label: 'Aceites' },
    { value: 'after-shave', label: 'After Shave' },
    { value: 'peines', label: 'Peines' },
    { value: 'kits', label: 'Kits' },
    { value: 'otros', label: 'Otros' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, branchesRes] = await Promise.all([
          api.products.getPublic(),
          api.public.getBranches(),
        ]);
        setProducts(productsRes.data.data);
        setBranches(branchesRes.data.data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = !selectedBranch || p.branch?._id === selectedBranch;
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchBranch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-barber-white text-4xl font-bold">Productos</h1>
        <div className="w-16 h-1 bg-barber-blue mx-auto mt-3 rounded-full" />
        <p className="text-barber-gray mt-4">
          Productos profesionales para tu cuidado personal
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
        >
          <option value="">Todas las sucursales</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <p className="text-center text-barber-gray">Cargando productos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-barber-gray">
          No se encontraron productos
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
