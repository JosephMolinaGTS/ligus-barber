import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// ============================================================
// AuthContext — Manejo de autenticación global
// Provee: user, token, login, register, logout, isAuthenticated
// ============================================================
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ligus-token'));
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Al montar, verificar si hay token guardado y validar
  // -----------------------------------------------------------
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        setUser(res.data.data);
      } catch (error) {
        // Token inválido o expirado
        localStorage.removeItem('ligus-token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // -----------------------------------------------------------
  // Login — Guardar token y usuario
  // -----------------------------------------------------------
  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    const { token: newToken, user: userData } = res.data.data;

    localStorage.setItem('ligus-token', newToken);
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // -----------------------------------------------------------
  // Register — Registrar y loguear automáticamente
  // -----------------------------------------------------------
  const register = async (data) => {
    const res = await api.auth.register(data);
    const { token: newToken, user: userData } = res.data.data;

    localStorage.setItem('ligus-token', newToken);
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // -----------------------------------------------------------
  // Logout — Limpiar estado
  // -----------------------------------------------------------
  const logout = () => {
    localStorage.removeItem('ligus-token');
    setToken(null);
    setUser(null);
  };

  // -----------------------------------------------------------
  // Valores computados para verificar roles fácilmente
  // -----------------------------------------------------------
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const isBarber = user?.role === 'barber';
  const isClient = user?.role === 'client';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isOwner,
        isAdmin,
        isBarber,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// -----------------------------------------------------------
// Hook personalizado para acceder al contexto de auth
// -----------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
