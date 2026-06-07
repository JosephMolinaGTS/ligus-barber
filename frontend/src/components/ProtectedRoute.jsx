import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

// ============================================================
// ProtectedRoute — Protege rutas según autenticación y rol
// Si no está autenticado → redirige a /login
// Si el rol no está permitido → redirige a /
// ============================================================
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Mostrar spinner mientras se verifica el token
  if (loading) {
    return <Loading />;
  }

  // No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rol no permitido → página principal
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Autenticado y autorizado → renderizar contenido
  return <Outlet />;
}
