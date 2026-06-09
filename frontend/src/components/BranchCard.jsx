import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi';
import { formatPhone } from '../utils/format';

// ============================================================
// BranchCard — Tarjeta de sucursal
// Muestra nombre, dirección, teléfono y horarios
// ============================================================
export default function BranchCard({ branch }) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-barber-charcoal rounded-xl border border-barber-dark overflow-hidden hover:border-barber-blue/50 transition-colors">
      {/* Imagen o placeholder */}
      <div className="h-40 bg-barber-dark flex items-center justify-center">
        {branch.image ? (
          <img
            src={branch.image}
            alt={branch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <span className="text-barber-white font-bold text-xl tracking-wider">
              LIGUS
            </span>
            <span className="text-barber-blue font-bold text-xl tracking-wider">
              {' '}BARBER
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-4">
        <h3 className="text-barber-white font-semibold text-lg">{branch.name}</h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-barber-gray text-sm">
            <FiMapPin size={14} className="text-barber-blue shrink-0" />
            <span>{branch.address}</span>
          </div>
          <div className="flex items-center gap-2 text-barber-gray text-sm">
            <FiPhone size={14} className="text-barber-blue shrink-0" />
            <span>{formatPhone(branch.phone)}</span>
          </div>
          {branch.schedule && (
            <div className="flex items-center gap-2 text-barber-gray text-sm">
              <FiClock size={14} className="text-barber-blue shrink-0" />
              <span>
                {branch.schedule.open} - {branch.schedule.close}
              </span>
            </div>
          )}
        </div>

        {/* Días de atención */}
        {branch.schedule?.days && (
          <div className="mt-3 flex gap-1">
            {dayNames.map((day, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded ${
                  branch.schedule.days.includes(idx)
                    ? 'bg-barber-blue/20 text-barber-blue'
                    : 'bg-barber-dark text-barber-gray/50'
                }`}
              >
                {day}
              </span>
            ))}
          </div>
        )}

        {/* Estado */}
        <div className="mt-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              branch.isActive
                ? 'bg-green-500/20 text-green-500'
                : 'bg-barber-red/20 text-barber-red'
            }`}
          >
            {branch.isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </div>
    </div>
  );
}
