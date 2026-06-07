import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';

// ============================================================
// PublicLayout — Layout para páginas públicas
// Navbar arriba + contenido principal + footer
// ============================================================
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-barber-black">
      <Navbar />

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-barber-charcoal border-t border-barber-dark mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Marca */}
            <div>
              <span className="text-barber-white font-bold text-xl tracking-wider">
                LIGUS
              </span>
              <span className="text-barber-blue font-bold text-xl tracking-wider">
                {' '}BARBER
              </span>
              <p className="text-barber-gray text-sm mt-2">
                Tu barbería de confianza. Estilo, precisión y profesionalismo.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-barber-white font-semibold mb-3">Navegación</h4>
              <ul className="space-y-2 text-barber-gray text-sm">
                <li><a href="/sucursales" className="hover:text-barber-white">Sucursales</a></li>
                <li><a href="/servicios" className="hover:text-barber-white">Servicios</a></li>
                <li><a href="/productos" className="hover:text-barber-white">Productos</a></li>
                <li><a href="/agendar" className="hover:text-barber-white">Agendar Cita</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-barber-white font-semibold mb-3">Contacto</h4>
              <ul className="space-y-3 text-barber-gray text-sm">
                <li className="flex items-center gap-2">
                  <FiMapPin className="text-barber-blue" size={16} />
                  Culiacán, Sinaloa, México
                </li>
                <li>
                  <a
                    href="https://wa.me/526673441050"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-green-500 transition-colors"
                  >
                    <FaWhatsapp className="text-green-500" size={16} />
                    667 344 1050
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/ligusbarber"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-500 transition-colors"
                    title="Instagram"
                  >
                    <FaInstagram size={18} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@ligusbarber"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-barber-white transition-colors"
                    title="TikTok"
                  >
                    <FaTiktok size={18} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea decorativa roja */}
          <div className="h-[1px] bg-barber-red my-6" />

          <p className="text-barber-gray text-xs text-center">
            © {new Date().getFullYear()} LIGUS BARBER. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
