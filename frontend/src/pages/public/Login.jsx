import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ============================================================
// Login — Página de inicio de sesión
// Formulario centrado con email y contraseña
// ============================================================
export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      toast.success(`Bienvenido, ${user.name}`);

      // Redirigir según rol
      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'admin' || user.role === 'barber') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Credenciales inválidas');
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
          <p className="text-barber-gray text-sm mt-2">Iniciá sesión en tu cuenta</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-barber-charcoal rounded-xl border border-barber-dark p-6"
        >
          <div className="space-y-4">
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
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-3 rounded-lg font-medium mt-6 transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Link a registro */}
        <p className="text-center text-barber-gray text-sm mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-barber-blue hover:text-barber-blue-light">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
