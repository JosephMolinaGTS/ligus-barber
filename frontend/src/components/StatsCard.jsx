// ============================================================
// StatsCard — Tarjeta de estadística para dashboards
// Props: title, value, icon, color, trend (opcional)
// ============================================================
export default function StatsCard({ title, value, icon: Icon, color = 'blue', trend }) {
  // Mapa de colores de Tailwind
  const colorMap = {
    blue: 'text-barber-blue bg-barber-blue/10',
    red: 'text-barber-red bg-barber-red/10',
    green: 'text-green-500 bg-green-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    white: 'text-barber-white bg-barber-white/10',
  };

  return (
    <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-barber-gray text-sm font-medium">{title}</p>
          <p className="text-barber-white text-2xl font-bold mt-1">{value}</p>
          {trend !== undefined && (
            <p
              className={`text-xs mt-1 ${
                trend >= 0 ? 'text-green-500' : 'text-barber-red'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs periodo anterior
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
