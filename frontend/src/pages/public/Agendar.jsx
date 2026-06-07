import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';
import HorizontalCalendar from '../../components/HorizontalCalendar';
import TimeSlotPicker from '../../components/TimeSlotPicker';

// ============================================================
// Agendar — Flujo multi-paso para reservar una cita
// Soporta booking SIN login (guest) o CON login
// Paso 1: Servicio → Paso 2: Fecha → Paso 3: Hora
// Paso 4: Datos contacto → Paso 5: Confirmación
// ============================================================
export default function Agendar() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Datos del formulario
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selección actual
  const [selected, setSelected] = useState({
    service: null,
    date: null,
    time: '',
  });

  // Datos de contacto (para guest booking)
  const [contact, setContact] = useState({
    name: '',
    phone: '',
    observations: '',
  });

  // Cargar servicios al inicio
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.services.getPublic();
        setServices(res.data.data);
      } catch (error) {
        toast.error('Error al cargar servicios');
      }
    };
    loadServices();
  }, []);

  // Cargar horarios disponibles cuando se selecciona fecha
  useEffect(() => {
    if (selected.date && selected.service) {
      const loadSlots = async () => {
        try {
          // Generar todos los slots posibles
          const allSlots = [
            '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
            '18:00', '18:30', '19:00', '19:30',
          ];

          // Intentar obtener slots ocupados
          try {
            const res = await api.appointments.getAvailableSlots({
              service: selected.service._id,
              date: selected.date.toISOString(),
            });
            const booked = res.data.data || [];
            setAvailableSlots(allSlots.filter((slot) => !booked.includes(slot)));
          } catch {
            // Si la API no soporta este filtro, mostrar todos los slots
            setAvailableSlots(allSlots);
          }
        } catch (error) {
          console.error('Error cargando horarios:', error);
        }
      };
      loadSlots();
    }
  }, [selected.date, selected.service]);

  // -----------------------------------------------------------
  // Confirmar y crear la cita
  // -----------------------------------------------------------
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        branch: selected.service.branches[0], // Usar primera sucursal del servicio
        service: selected.service._id,
        date: selected.date.toISOString(),
        time: selected.time,
      };

      // Si está autenticado, usar su ID
      if (isAuthenticated) {
        appointmentData.client = user._id;
      } else {
        // Guest booking: enviar datos de contacto
        appointmentData.guestName = contact.name;
        appointmentData.guestPhone = contact.phone;
        appointmentData.observations = contact.observations;
      }

      await api.appointments.create(appointmentData);
      toast.success('¡Cita agendada correctamente!');
      navigate(isAuthenticated ? '/mis-citas' : '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agendar cita');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // Validar formulario de contacto
  // -----------------------------------------------------------
  const isContactValid = () => {
    return contact.name.trim() && contact.phone.trim();
  };

  // -----------------------------------------------------------
  // Steps del formulario
  // -----------------------------------------------------------
  const steps = [
    { num: 1, label: 'Servicio' },
    { num: 2, label: 'Fecha' },
    { num: 3, label: 'Hora' },
    { num: 4, label: 'Datos' },
    { num: 5, label: 'Confirmar' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-barber-white text-4xl font-bold">Agendar Cita</h1>
        <div className="w-16 h-1 bg-barber-blue mx-auto mt-3 rounded-full" />
        {!isAuthenticated && (
          <p className="text-barber-gray text-sm mt-3">
            No necesitás crear cuenta para agendar
          </p>
        )}
      </div>

      {/* Indicador de progreso */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.num
                  ? 'bg-barber-blue text-white'
                  : 'bg-barber-dark text-barber-gray'
              }`}
            >
              {step > s.num ? <FiCheck size={16} /> : s.num}
            </div>
            <span
              className={`hidden sm:inline ml-2 text-xs ${
                step >= s.num ? 'text-barber-white' : 'text-barber-gray'
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 h-[2px] mx-2 ${
                  step > s.num ? 'bg-barber-blue' : 'bg-barber-dark'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-barber-charcoal rounded-xl border border-barber-dark p-6">
        {/* Paso 1: Seleccionar servicio */}
        {step === 1 && (
          <StepContent title="Elegí un servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelected({ ...selected, service });
                    setStep(2);
                  }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selected.service?._id === service._id
                      ? 'border-barber-blue bg-barber-blue/10'
                      : 'border-barber-dark hover:border-barber-blue/50 bg-barber-dark/50'
                  }`}
                >
                  <h3 className="text-barber-white font-semibold">{service.name}</h3>
                  <p className="text-barber-gray text-sm mt-1 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-barber-blue font-bold">${service.price}</span>
                    <span className="text-barber-gray text-sm">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 2: Seleccionar fecha */}
        {step === 2 && (
          <StepContent title="Elegí una fecha">
            <HorizontalCalendar
              selectedDate={selected.date}
              onDateSelect={(date) => {
                setSelected({ ...selected, date, time: '' });
                setStep(3);
              }}
            />
          </StepContent>
        )}

        {/* Paso 3: Seleccionar hora */}
        {step === 3 && (
          <StepContent title="Elegí un horario">
            <TimeSlotPicker
              selectedTime={selected.time}
              onTimeSelect={(time) => {
                setSelected({ ...selected, time });
                setStep(4);
              }}
              bookedTimes={[]}
            />
          </StepContent>
        )}

        {/* Paso 4: Datos de contacto (solo para guest) */}
        {step === 4 && (
          <StepContent title="Tus datos de contacto">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-barber-gray text-sm mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white placeholder-barber-gray focus:border-barber-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-barber-gray text-sm mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="667 123 4567"
                    className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white placeholder-barber-gray focus:border-barber-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-barber-gray text-sm mb-1">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={contact.observations}
                    onChange={(e) => setContact({ ...contact, observations: e.target.value })}
                    placeholder="Algún detalle adicional..."
                    rows={3}
                    className="w-full bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white placeholder-barber-gray focus:border-barber-blue focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-barber-white mb-2">
                  <span className="text-barber-gray">Nombre:</span> {user?.name}
                </p>
                <p className="text-barber-white">
                  <span className="text-barber-gray">Teléfono:</span> {user?.phone}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated && !isContactValid()) {
                  toast.error('Completá nombre y teléfono');
                  return;
                }
                setStep(5);
              }}
              className="w-full mt-6 bg-barber-blue hover:bg-barber-blue-light text-white py-3 rounded-lg font-medium transition-colors"
            >
              Continuar
            </button>
          </StepContent>
        )}

        {/* Paso 5: Confirmación */}
        {step === 5 && (
          <StepContent title="Resumen de tu cita">
            <div className="space-y-3 mb-6">
              <SummaryRow label="Servicio" value={selected.service?.name} />
              <SummaryRow label="Fecha" value={
                selected.date?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              } />
              <SummaryRow label="Hora" value={selected.time} />
              {!isAuthenticated && (
                <>
                  <SummaryRow label="Nombre" value={contact.name} />
                  <SummaryRow label="Teléfono" value={contact.phone} />
                  {contact.observations && (
                    <SummaryRow label="Observaciones" value={contact.observations} />
                  )}
                </>
              )}
              <div className="h-[1px] bg-barber-dark" />
              <SummaryRow
                label="Precio"
                value={`$${selected.service?.price}`}
                highlight
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-barber-blue hover:bg-barber-blue-light text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Agendando...' : 'Confirmar Cita'}
            </button>
          </StepContent>
        )}

        {/* Botones de navegación */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-barber-gray hover:text-barber-white text-sm mt-4"
          >
            <FiArrowLeft size={16} />
            Volver
          </button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// Sub-componentes
// -----------------------------------------------------------
function StepContent({ title, children }) {
  return (
    <div>
      <h3 className="text-barber-white text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-barber-gray text-sm">{label}</span>
      <span
        className={`text-sm font-medium text-right ${
          highlight ? 'text-barber-blue text-lg' : 'text-barber-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
