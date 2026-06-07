import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiUsers,
  FiUser,
  FiScissors,
  FiShoppingBag,
  FiMapPin,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// ============================================================
// Sidebar — Panel de navegación administrativo
// Se muestra en rutas /admin/* y /owner/*
// ============================================================
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isOwner } = useAuth();

  // -----------------------------------------------------------
  // Definición de items del menú según rol
  // -----------------------------------------------------------
  const menuItems = [
    // Dashboard — solo el dueño
    ...(isOwner
      ? [
          {
            to: '/owner/dashboard',
            icon: FiChevronRight,
            label: 'Dashboard',
            ownerOnly: true,
          },
        ]
      : []),
    { to: '/admin', icon: FiChevronRight, label: 'Resumen' },
    { to: '/admin/citas', icon: FiCalendar, label: 'Citas' },
    { to: '/admin/clientes', icon: FiUsers, label: 'Clientes' },
    { to: '/admin/empleados', icon: FiUser, label: 'Empleados' },
    { to: '/admin/servicios', icon: FiScissors, label: 'Servicios' },
    { to: '/admin/productos', icon: FiShoppingBag, label: 'Productos' },
    { to: '/admin/sucursales', icon: FiMapPin, label: 'Sucursales' },
  ];

  const isActive = (path) => {
    if (path === '/admin' || path === '/owner/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Botón toggle mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-barber-blue text-white p-2 rounded-lg"
      >
        {mobileOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[65px] left-0 h-[calc(100vh-65px)] bg-barber-black border-r border-barber-dark z-40
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Botón colapsar — solo desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-4 bg-barber-dark border border-barber-dark rounded-full p-1 text-barber-gray hover:text-barber-white"
        >
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-barber-dark">
          {!collapsed && (
            <div className="text-center">
              <span className="text-barber-white font-bold text-lg tracking-wider">
                LIGUS
              </span>{' '}
              <span className="text-barber-blue font-bold text-lg tracking-wider">
                BARBER
              </span>
              <p className="text-barber-gray text-xs mt-1">Panel Administrativo</p>
            </div>
          )}
        </div>

        {/* Menú de navegación */}
        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors
                ${
                  isActive(item.to)
                    ? 'bg-barber-blue/20 text-barber-blue border-l-2 border-barber-blue'
                    : 'text-barber-gray hover:text-barber-white hover:bg-barber-dark'
                }
              `}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Información del usuario + logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-barber-dark">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-barber-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-barber-gray text-xs capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-barber-gray hover:text-barber-red text-sm w-full"
          >
            <FiLogOut size={16} />
            {!collapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
