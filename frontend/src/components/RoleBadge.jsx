import { FiCrown, FiShield, FiScissors } from 'react-icons/fi';

// ============================================================
// RoleBadge — Badge visual del rol del usuario
// Muestra icono + etiqueta con color específico por rol
// ============================================================

const ROLE_CONFIG = {
  owner: {
    label: 'DUEÑO',
    icon: FiCrown,
    color: 'bg-barber-blue text-white',
  },
  admin: {
    label: 'ADMIN',
    icon: FiShield,
    color: 'bg-green-600 text-white',
  },
  barber: {
    label: 'BARBERO',
    icon: FiScissors,
    color: 'bg-barber-red text-white',
  },
};

export default function RoleBadge({ role, showLabel = true, size = 'sm' }) {
  const config = ROLE_CONFIG[role];

  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.color}
        ${sizeClasses[size]}
      `}
    >
      <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// Exportar config para uso externo si es necesario
export { ROLE_CONFIG };
