import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Sucursales from './pages/public/Sucursales';
import Servicios from './pages/public/Servicios';
import Productos from './pages/public/Productos';
import Agendar from './pages/public/Agendar';
import Perfil from './pages/public/Perfil';
import MisCitas from './pages/public/MisCitas';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCitas from './pages/admin/AdminCitas';
import AdminClientes from './pages/admin/AdminClientes';
import AdminEmpleados from './pages/admin/AdminEmpleados';
import AdminServicios from './pages/admin/AdminServicios';
import AdminProductos from './pages/admin/AdminProductos';
import AdminSucursales from './pages/admin/AdminSucursales';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// ============================================================
// App — Componente raíz con todas las rutas
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #2B2B2B',
          },
          success: {
            iconTheme: { primary: '#004B7A', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#9B0000', secondary: '#FFFFFF' },
          },
        }}
      />

      <Routes>
        {/* -------------------------------------------------------
            RUTAS PÚBLICAS
            ------------------------------------------------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/sucursales" element={<Sucursales />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/agendar" element={<Agendar />} />

          {/* Rutas protegidas (autenticación requerida) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/mis-citas" element={<MisCitas />} />
          </Route>
        </Route>

        {/* -------------------------------------------------------
            RUTAS DE AUTH (sin layout público)
            ------------------------------------------------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* -------------------------------------------------------
            RUTAS ADMINISTRATIVAS (admin + owner)
            ------------------------------------------------------- */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/citas" element={<AdminCitas />} />
            <Route path="/admin/clientes" element={<AdminClientes />} />
            <Route path="/admin/empleados" element={<AdminEmpleados />} />
            <Route path="/admin/servicios" element={<AdminServicios />} />
            <Route path="/admin/productos" element={<AdminProductos />} />
            <Route path="/admin/sucursales" element={<AdminSucursales />} />
          </Route>
        </Route>

        {/* -------------------------------------------------------
            RUTA EXCLUSIVA DEL DUEÑO
            ------------------------------------------------------- */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>
        </Route>

        {/* -------------------------------------------------------
            RUTA CATCH-ALL → redirigir a inicio
            ------------------------------------------------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
