import { useState, useEffect } from 'react';
import api from '../../services/api';
import BranchCard from '../../components/BranchCard';

// ============================================================
// Sucursales — Listado público de sucursales
// ============================================================
export default function Sucursales() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.public.getBranches();
        setBranches(res.data.data);
      } catch (error) {
        console.error('Error cargando sucursales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  // Filtrar por búsqueda
  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-barber-white text-4xl font-bold">Sucursales</h1>
        <div className="w-16 h-1 bg-barber-blue mx-auto mt-3 rounded-full" />
        <p className="text-barber-gray mt-4">
          Encontrá la sucursal más cercana
        </p>
      </div>

      {/* Buscador */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar sucursal..."
          className="w-full bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
        />
      </div>

      {/* Grid de sucursales */}
      {loading ? (
        <p className="text-center text-barber-gray">Cargando sucursales...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-barber-gray">No se encontraron sucursales</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((branch) => (
            <BranchCard key={branch._id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}
