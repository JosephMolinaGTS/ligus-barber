import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';
import HorizontalCalendar from '../../components/HorizontalCalendar';
import TimeSlotPicker from '../../components/TimeSlotPicker';
import { formatPhone, phoneMask } from '../../utils/format';

// ============================================================
// Agendar — Flujo multi-paso para reservar una cita
// Paso 1: Servicio → Paso 2: Sucursal → Paso 3: Barbero
// Paso 4: Fecha → Paso 5: Hora → Paso 6: Datos → Paso 7: Confirmación
// ============================================================
export default function Agendar() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Datos del formulario
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [barbers, setBarbers] = useState([]);

  // Selección actual
  const [selected, setSelected] = useState({
    service: null,
    branch: null,
    barber: null,
    date: null,
    time: '',
  });

  // Datos de contacto (para guest booking)
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    observations: '',
  });

  // Cargar servicios y sucursales al inicio
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, branchesRes] = await Promise.all([
          api.services.getPublic(),
          api.public.getBranches(),
        ]);
        setServices(servicesRes.data.data);
        setBranches(branchesRes.data.data);
      } catch (error) {
        toast.error('Error al cargar datos');
      }
    };
    loadData();
  }, []);

  // Cargar barberos cuando se selecciona sucursal
  useEffect(() => {
    if (selected.branch) {
      const loadBarbers = async () => {
        try {
          const res = await api.public.getBarbersByBranch(selected.branch._id);
          setBarbers(res.data.data || []);
        } catch (error) {
          console.error('Error cargando barberos:', error);
          setBarbers([]);
        }
      };
      loadBarbers();
    }
  }, [selected.branch]);

  // -----------------------------------------------------------
  // Confirmar y crear la cita
  // -----------------------------------------------------------
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        branch: selected.branch._id,
        service: selected.service._id,
        barber: selected.barber._id,
        date: selected.date.toISOString(),
        time: selected.time,
      };

      // Si está autenticado, usar endpoint protegido
      if (isAuthenticated) {
        appointmentData.client = user._id;
        await api.appointments.create(appointmentData);
      } else {
        // Guest booking: usar endpoint público
        appointmentData.guestName = `${contact.firstName} ${contact.lastName}`;
        appointmentData.guestPhone = contact.phone;
        appointmentData.observations = contact.observations;
        await api.public.createAppointment(appointmentData);
      }

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
    const nameValid = contact.firstName.trim().length >= 3;
    const lastValid = contact.lastName.trim().length >= 3;
    const phoneValid = /^\d{10}$/.test(contact.phone.replace(/\s/g, ''));
    return nameValid && lastValid && phoneValid;
  };

  // Obtener errores específicos para mostrar al usuario
  const getContactErrors = () => {
    const errors = [];
    if (contact.firstName.trim().length > 0 && contact.firstName.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 letras');
    }
    if (contact.lastName.trim().length > 0 && contact.lastName.trim().length < 3) {
      errors.push('El apellido debe tener al menos 3 letras');
    }
    if (contact.phone.length > 0 && !/^\d{10}$/.test(contact.phone.replace(/\s/g, ''))) {
      errors.push('El teléfono debe tener 10 dígitos (ej: 667 123 4567)');
    }
    return errors;
  };

  // -----------------------------------------------------------
  // Steps del formulario
  // -----------------------------------------------------------
  const steps = [
    { num: 1, label: 'Servicio' },
    { num: 2, label: 'Sucursal' },
    { num: 3, label: 'Barbero' },
    { num: 4, label: 'Fecha' },
    { num: 5, label: 'Hora' },
    { num: 6, label: 'Datos' },
    { num: 7, label: 'Confirmar' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-white text-4xl font-bold">Agendar Cita</h1>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-3 rounded-full" />
        {!isAuthenticated && (
          <p className="text-gray-400 text-sm mt-3">
            No necesitas crear cuenta para agendar
          </p>
        )}
      </div>

      {/* Indicador de progreso */}
      <div className="flex items-center justify-center mb-8 flex-wrap gap-2">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.num
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {step > s.num ? <FiCheck size={16} /> : s.num}
            </div>
            <span
              className={`hidden sm:inline ml-2 text-xs ${
                step >= s.num ? 'text-white' : 'text-gray-500'
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`w-6 h-[2px] mx-1 ${
                  step > s.num ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        {/* Paso 1: Seleccionar servicio */}
        {step === 1 && (
          <StepContent title="Elige un servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelected({ ...selected, service });
                    setStep(2);
                  }}
                  className="text-left p-4 rounded-lg border border-gray-600 hover:border-blue-400 bg-gray-700/50 transition-colors"
                >
                  <h3 className="text-white font-semibold">{service.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-blue-400 font-bold">${service.price}</span>
                    <span className="text-gray-400 text-sm">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 2: Seleccionar sucursal */}
        {step === 2 && (
          <StepContent title="Elige una sucursal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <button
                  key={branch._id}
                  onClick={() => {
                    setSelected({ ...selected, branch, barber: null });
                    setStep(3);
                  }}
                  className="text-left p-4 rounded-lg border border-gray-600 hover:border-blue-400 bg-gray-700/50 transition-colors"
                >
                  <h3 className="text-white font-semibold">{branch.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{branch.address}</p>
                  <p className="text-gray-500 text-xs mt-1">📞 {formatPhone(branch.phone)}</p>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 3: Seleccionar barbero */}
        {step === 3 && (
          <StepContent title="Elige un profesional">
            {barbers.length === 0 ? (
              <p className="text-gray-400">No hay barberos disponibles en esta sucursal</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {barbers.map((barber) => (
                  <button
                    key={barber._id}
                    onClick={() => {
                      setSelected({ ...selected, barber });
                      setStep(4);
                    }}
                    className="text-center p-4 rounded-lg border border-gray-600 hover:border-blue-400 bg-gray-700/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {barber.name?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-semibold">{barber.name}</p>
                    <p className="text-gray-400 text-sm">{formatPhone(barber.phone)}</p>
                  </button>
                ))}
              </div>
            )}
          </StepContent>
        )}

        {/* Paso 4: Seleccionar fecha */}
        {step === 4 && (
          <StepContent title="Elige una fecha">
            <HorizontalCalendar
              selectedDate={selected.date}
              onDateSelect={(date) => {
                setSelected({ ...selected, date, time: '' });
                setStep(5);
              }}
            />
          </StepContent>
        )}

        {/* Paso 5: Seleccionar hora */}
        {step === 5 && (
          <StepContent title="Elige un horario">
            <TimeSlotPicker
              selectedTime={selected.time}
              onTimeSelect={(time) => {
                setSelected({ ...selected, time });
                setStep(6);
              }}
              bookedTimes={[]}
            />
          </StepContent>
        )}

        {/* Paso 6: Datos de contacto */}
        {step === 6 && (
          <StepContent title="Tus datos de contacto">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={contact.firstName}
                      onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                      placeholder="Juan"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={contact.lastName}
                      onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                      placeholder="Pérez"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Teléfono *
                  </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: phoneMask(e.target.value) })}
                      placeholder="667 123 4567"
                      maxLength={12}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={contact.observations}
                    onChange={(e) => setContact({ ...contact, observations: e.target.value })}
                    placeholder="Algún detalle adicional..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-white mb-2">
                  <span className="text-gray-400">Nombre:</span> {user?.name}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Teléfono:</span> {formatPhone(user?.phone) || 'No registrado'}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated && !isContactValid()) {
                  const errors = getContactErrors();
                  errors.forEach((err) => toast.error(err));
                  return;
                }
                setStep(7);
              }}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Continuar
            </button>
          </StepContent>
        )}

        {/* Paso 7: Confirmación */}
        {step === 7 && (
          <StepContent title="Resumen de tu cita">
            <div className="space-y-3 mb-6">
              <SummaryRow label="Servicio" value={selected.service?.name} />
              <SummaryRow label="Sucursal" value={selected.branch?.name} />
              <SummaryRow label="Barbero" value={selected.barber?.name} />
              <SummaryRow label="Fecha" value={
                selected.date?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              } />
              <SummaryRow label="Hora" value={selected.time} />
              {!isAuthenticated && (
                <>
                  <SummaryRow label="Nombre" value={`${contact.firstName} ${contact.lastName}`} />
                  <SummaryRow label="Teléfono" value={formatPhone(contact.phone)} />
                  {contact.observations && (
                    <SummaryRow label="Observaciones" value={contact.observations} />
                  )}
                </>
              )}
              <div className="h-[1px] bg-gray-600" />
              <SummaryRow
                label="Precio"
                value={`$${selected.service?.price}`}
                highlight
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Agendando...' : 'Confirmar Cita'}
            </button>
          </StepContent>
        )}

        {/* Botones de navegación */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mt-4"
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
      <h3 className="text-white text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span
        className={`text-sm font-medium text-right ${
          highlight ? 'text-blue-400 text-lg' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
