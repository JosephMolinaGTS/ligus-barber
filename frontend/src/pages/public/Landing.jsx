import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiArrowRight, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa';
import api from '../../services/api';
import ServiceCard from '../../components/ServiceCard';
import ProductCard from '../../components/ProductCard';
import BranchCard from '../../components/BranchCard';

// ============================================================
// Landing — Página principal pública
// Hero + servicios destacados + productos promocionados + sucursales
// ============================================================
export default function Landing() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, productsRes, branchesRes] = await Promise.all([
          api.services.getPublic(),
          api.products.getPublic({ isPromoted: 'true' }),
          api.public.getBranches(),
        ]);
        setServices(servicesRes.data.data.slice(0, 6));
        setProducts(productsRes.data.data.slice(0, 4));
        setBranches(branchesRes.data.data.slice(0, 3));
      } catch (error) {
        console.error('Error cargando datos de landing:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      {/* -------------------------------------------------------
          HERO SECTION
          ------------------------------------------------------- */}
      <section className="relative bg-gradient-to-b from-barber-charcoal to-barber-black py-20 md:py-32">
        {/* Línea decorativa roja */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-barber-red" />

        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Logo grande */}
          <div className="mb-6">
            <span className="text-barber-white text-5xl md:text-7xl font-bold tracking-wider">
              LIGUS
            </span>
            <span className="text-barber-blue text-5xl md:text-7xl font-bold tracking-wider">
              {' '}BARBER
            </span>
          </div>

          <p className="text-barber-gray text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Tu barbería de confianza. Estilo, precisión y profesionalismo.
            Reservá tu cita y experimentá la diferencia.
          </p>

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/agendar"
              className="flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <FiCalendar size={18} />
              Agendar Cita
            </Link>
            <Link
              to="/servicios"
              className="flex items-center gap-2 border border-barber-dark hover:border-barber-blue text-barber-gray hover:text-barber-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Ver Servicios
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------
          SERVICIOS DESTACADOS
          ------------------------------------------------------- */}
      {services.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <SectionTitle title="Nuestros Servicios" accent="blue" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/servicios"
              className="text-barber-blue hover:text-barber-blue-light text-sm font-medium"
            >
              Ver todos los servicios →
            </Link>
          </div>
        </section>
      )}

      {/* Línea separadora roja */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-[1px] bg-barber-red/30" />
      </div>

      {/* -------------------------------------------------------
          PRODUCTOS PROMOCIONADOS
          ------------------------------------------------------- */}
      {products.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <SectionTitle title="Productos Destacados" accent="blue" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/productos"
              className="text-barber-blue hover:text-barber-blue-light text-sm font-medium"
            >
              Ver catálogo completo →
            </Link>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------
          SUCURSALES
          ------------------------------------------------------- */}
      {branches.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4">
          <SectionTitle title="Nuestras Sucursales" accent="blue" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {branches.map((branch) => (
              <BranchCard key={branch._id} branch={branch} />
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------
          CTA FINAL
          ------------------------------------------------------- */}
      <section className="py-16 bg-barber-charcoal">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-barber-white text-3xl font-bold mb-4">
            ¿Listo para un nuevo look?
          </h2>
          <p className="text-barber-gray mb-8">
            Reservá tu cita ahora y dejá que nuestros profesionales cuiden tu estilo.
          </p>
          <Link
            to="/agendar"
            className="inline-flex items-center gap-2 bg-barber-blue hover:bg-barber-blue-light text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <FiCalendar size={18} />
            Agendar Mi Cita
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------
          CONTACTO
          ------------------------------------------------------- */}
      <section className="py-12 bg-barber-black border-t border-barber-dark">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ubicación */}
            <div className="flex items-center gap-3 text-barber-gray">
              <FiMapPin className="text-barber-blue" size={20} />
              <span>Culiacán, Sinaloa, México</span>
            </div>

            {/* Redes sociales y contacto */}
            <div className="flex items-center gap-6">
              <a
                href="https://wa.me/526673441050"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-barber-gray hover:text-green-500 transition-colors"
                title="WhatsApp"
              >
                <FaWhatsapp size={20} />
                <span className="hidden sm:inline">667 344 1050</span>
              </a>
              <a
                href="https://www.instagram.com/ligusbarber"
                target="_blank"
                rel="noopener noreferrer"
                className="text-barber-gray hover:text-pink-500 transition-colors"
                title="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@ligusbarber"
                target="_blank"
                rel="noopener noreferrer"
                className="text-barber-gray hover:text-barber-white transition-colors"
                title="TikTok"
              >
                <FaTiktok size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// -----------------------------------------------------------
// Sub-componente: título de sección
// -----------------------------------------------------------
function SectionTitle({ title, accent = 'blue' }) {
  const accentColors = {
    blue: 'bg-barber-blue',
    red: 'bg-barber-red',
  };

  return (
    <div className="text-center">
      <h2 className="text-barber-white text-3xl font-bold">{title}</h2>
      <div
        className={`w-16 h-1 ${accentColors[accent]} mx-auto mt-3 rounded-full`}
      />
    </div>
  );
}
