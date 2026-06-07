import { FiLoader } from 'react-icons/fi';

// ============================================================
// DataTable — Tabla de datos reutilizable
// Props: columns, data, loading, emptyMessage
// columns: [{ key, label, render? }]
// ============================================================
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No hay registros',
}) {
  if (loading) {
    return (
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-8 text-center">
        <FiLoader className="animate-spin text-barber-blue mx-auto mb-2" size={24} />
        <p className="text-barber-gray text-sm">Cargando datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-8 text-center">
        <p className="text-barber-gray">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-barber-charcoal rounded-xl border border-barber-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-barber-dark">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-barber-gray uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-barber-dark">
            {data.map((row, idx) => (
              <tr
                key={row._id || idx}
                className="hover:bg-barber-dark/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-barber-white">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
