import { FiClock, FiDollarSign } from 'react-icons/fi';

// ============================================================
// ServiceCard — Tarjeta de servicio para catálogo público
// Muestra nombre, descripción, precio, duración y sucursales
// ============================================================
export default function ServiceCard({ service }) {
  return (
    <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6 hover:border-barber-blue/50 transition-colors">
      {/* Nombre del servicio */}
      <h3 className="text-barber-white font-semibold text-lg">{service.name}</h3>

      {/* Descripción */}
      {service.description && (
        <p className="text-barber-gray text-sm mt-2">{service.description}</p>
      )}

      {/* Precio y duración */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1 text-barber-blue">
          <FiDollarSign size={16} />
          <span className="font-bold text-xl">{service.price}</span>
        </div>
        <div className="flex items-center gap-1 text-barber-gray">
          <FiClock size={16} />
          <span className="text-sm">{service.duration} min</span>
        </div>
      </div>

      {/* Sucursales donde está disponible */}
      {service.branches && service.branches.length > 0 && (
        <div className="mt-4 pt-3 border-t border-barber-dark">
          <p className="text-barber-gray text-xs mb-1">Disponible en:</p>
          <div className="flex flex-wrap gap-1">
            {service.branches.map((branch) => (
              <span
                key={branch._id || branch}
                className="text-xs bg-barber-dark text-barber-gray px-2 py-1 rounded"
              >
                {branch.name || branch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
