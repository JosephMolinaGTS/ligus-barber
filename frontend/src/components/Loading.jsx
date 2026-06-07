// ============================================================
// Loading — Spinner de carga centrado
// Se usa mientras se verifica el token o cargan datos
// ============================================================
export default function Loading({ message = 'Cargando...' }) {
  return (
    <div className="min-h-screen bg-barber-black flex items-center justify-center">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="w-12 h-12 border-4 border-barber-dark border-t-barber-blue rounded-full animate-spin mx-auto mb-4" />
        <p className="text-barber-gray text-sm">{message}</p>
      </div>
    </div>
  );
}
