import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

// ============================================================
// Agendar — Flujo multi-paso para reservar una cita
// Paso 1: Sucursal → Paso 2: Servicio → Paso 3: Barbero
// Paso 4: Fecha → Paso 5: Hora → Paso 6: Confirmación
// ============================================================
export default function Agendar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Datos del formulario
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selección actual
  const [selected, setSelected] = useState({
    branch: null,
    service: null,
    barber: null,
    date: '',
    time: '',
  });

  // Cargar sucursales al inicio
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.public.getBranches();
        setBranches(res.data.data);
      } catch (error) {
        toast.error('Error al cargar sucursales');
      }
    };
    loadBranches();
  }, []);

  // Cargar servicios cuando se selecciona sucursal
  useEffect(() => {
    if (selected.branch) {
      const loadServices = async () => {
        try {
          const res = await api.services.getPublic({ branch: selected.branch._id });
          setServices(res.data.data);
        } catch (error) {
          console.error('Error cargando servicios:', error);
        }
      };
      loadServices();
    }
  }, [selected.branch]);

  // Cargar barberos cuando se selecciona servicio
  useEffect(() => {
    if (selected.service) {
      setBarbers(selected.service.barbers || []);
    }
  }, [selected.service]);

  // Cargar horarios disponibles cuando se selecciona fecha y barbero
  useEffect(() => {
    if (selected.barber && selected.service && selected.date) {
      const loadSlots = async () => {
        try {
          const res = await api.appointments.getAvailableSlots({
            barber: selected.barber._id,
            service: selected.service._id,
            date: selected.date,
          });
          setAvailableSlots(res.data.data);
        } catch (error) {
          console.error('Error cargando horarios:', error);
        }
      };
      loadSlots();
    }
  }, [selected.barber, selected.service, selected.date]);

  // -----------------------------------------------------------
  // Confirmar y crear la cita
  // -----------------------------------------------------------
  const handleConfirm = async () => {
    if (!isAuthenticated) {
      toast.error('Necesitás iniciar sesión para agendar');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.appointments.create({
        branch: selected.branch._id,
        service: selected.service._id,
        barber: selected.barber._id,
        date: selected.date,
        time: selected.time,
      });
      toast.success('¡Cita agendada correctamente!');
      navigate('/mis-citas');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agendar cita');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // Steps del formulario
  // -----------------------------------------------------------
  const steps = [
    { num: 1, label: 'Sucursal' },
    { num: 2, label: 'Servicio' },
    { num: 3, label: 'Barbero' },
    { num: 4, label: 'Fecha' },
    { num: 5, label: 'Hora' },
    { num: 6, label: 'Confirmar' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-barber-white text-4xl font-bold">Agendar Cita</h1>
        <div className="w-16 h-1 bg-barber-blue mx-auto mt-3 rounded-full" />
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
        {/* Paso 1: Seleccionar sucursal */}
        {step === 1 && (
          <StepContent title="Elegí una sucursal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <button
                  key={branch._id}
                  onClick={() => {
                    setSelected({ ...selected, branch });
                    setStep(2);
                  }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selected.branch?._id === branch._id
                      ? 'border-barber-blue bg-barber-blue/10'
                      : 'border-barber-dark hover:border-barber-blue/50 bg-barber-dark/50'
                  }`}
                >
                  <h3 className="text-barber-white font-semibold">{branch.name}</h3>
                  <p className="text-barber-gray text-sm mt-1">{branch.address}</p>
                  <p className="text-barber-gray text-xs mt-1">📞 {branch.phone}</p>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 2: Seleccionar servicio */}
        {step === 2 && (
          <StepContent title="Elegí un servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelected({ ...selected, service });
                    setStep(3);
                  }}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selected.service?._id === service._id
                      ? 'border-barber-blue bg-barber-blue/10'
                      : 'border-barber-dark hover:border-barber-blue/50 bg-barber-dark/50'
                  }`}
                >
                  <h3 className="text-barber-white font-semibold">{service.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-barber-blue font-bold">${service.price}</span>
                    <span className="text-barber-gray text-sm">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 3: Seleccionar barbero */}
        {step === 3 && (
          <StepContent title="Elegí un barbero">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbers.map((barber) => (
                <button
                  key={barber._id}
                  onClick={() => {
                    setSelected({ ...selected, barber });
                    setStep(4);
                  }}
                  className={`text-center p-4 rounded-lg border transition-colors ${
                    selected.barber?._id === barber._id
                      ? 'border-barber-blue bg-barber-blue/10'
                      : 'border-barber-dark hover:border-barber-blue/50 bg-barber-dark/50'
                  }`}
                >
                  <div className="w-16 h-16 bg-barber-dark rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-barber-white text-xl font-bold">
                      {barber.name?.charAt(0)}
                    </span>
                  </div>
                  <p className="text-barber-white font-semibold">{barber.name}</p>
                </button>
              ))}
            </div>
          </StepContent>
        )}

        {/* Paso 4: Seleccionar fecha */}
        {step === 4 && (
          <StepContent title="Elegí una fecha">
            <input
              type="date"
              value={selected.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelected({ ...selected, date: e.target.value, time: '' });
                setStep(5);
              }}
              className="w-full max-w-sm bg-barber-dark border border-barber-dark rounded-lg px-4 py-3 text-barber-white focus:border-barber-blue focus:outline-none text-sm"
            />
          </StepContent>
        )}

        {/* Paso 5: Seleccionar hora */}
        {step === 5 && (
          <StepContent title="Elegí un horario">
            {availableSlots.length === 0 ? (
              <p className="text-barber-gray">
                No hay horarios disponibles para esta fecha. Elegí otra fecha.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelected({ ...selected, time: slot });
                      setStep(6);
                    }}
                    className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                      selected.time === slot
                        ? 'border-barber-blue bg-barber-blue/10 text-barber-blue'
                        : 'border-barber-dark hover:border-barber-blue/50 text-barber-white bg-barber-dark/50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </StepContent>
        )}

        {/* Paso 6: Confirmación */}
        {step === 6 && (
          <StepContent title="Resumen de tu cita">
            <div className="space-y-3 mb-6">
              <SummaryRow label="Sucursal" value={selected.branch?.name} />
              <SummaryRow label="Servicio" value={selected.service?.name} />
              <SummaryRow label="Barbero" value={selected.barber?.name} />
              <SummaryRow label="Fecha" value={selected.date} />
              <SummaryRow label="Hora" value={selected.time} />
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
        className={`text-sm font-medium ${
          highlight ? 'text-barber-blue text-lg' : 'text-barber-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
