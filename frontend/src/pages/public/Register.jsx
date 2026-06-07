import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ============================================================
// Register — Página de registro de usuarios nuevos
// ============================================================
export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseñas
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Cuenta creada correctamente');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-barber-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-barber-white text-3xl font-bold tracking-wider">
            LIGUS
          </span>
          <span className="text-barber-blue text-3xl font-bold tracking-wider">
            {' '}BARBER
          </span>
          <p className="text-barber-gray text-sm mt-2">Crea tu cuenta</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-barber-charcoal rounded-xl border border-barber-dark p-6"
        >
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-barber-gray text-sm mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-barber-gray text-sm mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-barber-gray text-sm mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
                placeholder="667 xxx xxxx"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-barber-gray text-sm mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-barber-gray text-sm mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
                placeholder="Repite tu contraseña"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-3 rounded-lg font-medium mt-6 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        {/* Link a login */}
        <p className="text-center text-barber-gray text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-barber-blue hover:text-barber-blue-light">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
