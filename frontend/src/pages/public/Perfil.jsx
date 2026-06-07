import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ============================================================
// Perfil — Página de perfil del usuario
// Editar datos personales y cambiar contraseña
// ============================================================
export default function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.auth.updateProfile(form);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Contraseña actualizada');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-barber-white text-4xl font-bold mb-8">Mi Perfil</h1>

      {/* Información de la cuenta */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-barber-blue rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-barber-white text-xl font-semibold">{user?.name}</h2>
            <p className="text-barber-gray text-sm">{user?.email}</p>
            <span className="text-barber-blue text-xs capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-barber-gray text-sm mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-barber-blue hover:bg-barber-blue-light text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        <h3 className="text-barber-white text-lg font-semibold mb-4">
          Cambiar Contraseña
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-barber-gray text-sm mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-barber-gray text-sm mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-barber-blue hover:bg-barber-blue-light text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
