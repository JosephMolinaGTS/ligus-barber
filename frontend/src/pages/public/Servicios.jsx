import { useState, useEffect } from 'react';
import api from '../../services/api';
import ServiceCard from '../../components/ServiceCard';

// ============================================================
// Servicios — Catálogo público de servicios
// Filtros por sucursal y búsqueda
// ============================================================
export default function Servicios() {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, branchesRes] = await Promise.all([
          api.services.getPublic(),
          api.public.getBranches(),
        ]);
        setServices(servicesRes.data.data);
        setBranches(branchesRes.data.data);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar por búsqueda y sucursal
  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch =
      !selectedBranch ||
      s.branches?.some((b) => (b._id || b) === selectedBranch);
    return matchSearch && matchBranch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-barber-white text-4xl font-bold">Servicios</h1>
        <div className="w-16 h-1 bg-barber-blue mx-auto mt-3 rounded-full" />
        <p className="text-barber-gray mt-4">
          Conocé todos nuestros servicios de barbería
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicio..."
          className="flex-1 bg-barber-charcoal border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
        />
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

      {/* Grid de servicios */}
      {loading ? (
        <p className="text-center text-barber-gray">Cargando servicios...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-barber-gray">
          No se encontraron servicios
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
