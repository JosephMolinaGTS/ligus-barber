import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ============================================================
// AdminLayout — Layout para paneles administrativos
// Sidebar fijo a la izquierda + contenido principal
// ============================================================
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-barber-black">
      {/* Sidebar — se maneja su propio responsive internamente */}
      <Sidebar />

      {/* Contenido principal — con margen para el sidebar en desktop */}
      <main className="lg:ml-64 pt-4 min-h-[calc(100vh-65px)]">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
