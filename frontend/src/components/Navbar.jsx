import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// ============================================================
// Navbar — Barra de navegación principal
// Visible en todas las páginas. Cambia según rol y estado de auth.
// ============================================================
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-barber-charcoal border-b border-barber-dark sticky top-0 z-50">
      {/* Línea decorativa roja en la parte inferior del navbar */}
      <div className="h-[1px] bg-barber-red" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-barber-white text-xl font-bold tracking-wider">
              LIGUS
            </span>
            <span className="text-barber-blue text-xl font-bold tracking-wider">
              BARBER
            </span>
          </Link>

          {/* Links de navegación — Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/sucursales">Sucursales</NavLink>
            <NavLink to="/servicios">Servicios</NavLink>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/agendar">Agendar Cita</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/mis-citas">Mis Citas</NavLink>
                <NavLink to="/perfil">Mi Perfil</NavLink>
                {(isAdmin || isOwner) && (
                  <NavLink to="/admin">Admin</NavLink>
                )}
                {isOwner && (
                  <NavLink to="/owner/dashboard">Dashboard</NavLink>
                )}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-barber-dark">
                  <span className="text-barber-gray text-sm">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-barber-gray hover:text-barber-red text-sm transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-barber-blue hover:bg-barber-blue-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón hamburguesa — Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-barber-white"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú mobile — se despliega al hacer click */}
      {isOpen && (
        <div className="md:hidden bg-barber-charcoal border-t border-barber-dark">
          <div className="px-4 py-3 space-y-2">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>
              Inicio
            </MobileNavLink>
            <MobileNavLink to="/sucursales" onClick={() => setIsOpen(false)}>
              Sucursales
            </MobileNavLink>
            <MobileNavLink to="/servicios" onClick={() => setIsOpen(false)}>
              Servicios
            </MobileNavLink>
            <MobileNavLink to="/productos" onClick={() => setIsOpen(false)}>
              Productos
            </MobileNavLink>
            <MobileNavLink to="/agendar" onClick={() => setIsOpen(false)}>
              Agendar Cita
            </MobileNavLink>

            {isAuthenticated ? (
              <>
                <MobileNavLink to="/mis-citas" onClick={() => setIsOpen(false)}>
                  Mis Citas
                </MobileNavLink>
                <MobileNavLink to="/perfil" onClick={() => setIsOpen(false)}>
                  Mi Perfil
                </MobileNavLink>
                {(isAdmin || isOwner) && (
                  <MobileNavLink to="/admin" onClick={() => setIsOpen(false)}>
                    Admin
                  </MobileNavLink>
                )}
                {isOwner && (
                  <MobileNavLink
                    to="/owner/dashboard"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-barber-red hover:bg-barber-dark rounded-lg text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-barber-blue text-white text-center px-4 py-2 rounded-lg text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// -----------------------------------------------------------
// Sub-componentes para simplificar el código
// -----------------------------------------------------------
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-barber-gray hover:text-barber-white text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 text-barber-gray hover:text-barber-white hover:bg-barber-dark rounded-lg text-sm"
    >
      {children}
    </Link>
  );
}
