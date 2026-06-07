// ============================================================
// TimeSlotPicker — Selector de horarios por período
// Muestra horarios agrupados: Mañana, Tarde, Noche
// ============================================================
export default function TimeSlotPicker({ selectedTime, onTimeSelect, bookedTimes = [] }) {
  // Definir períodos del día
  const periods = [
    {
      name: 'Mañana',
      slots: ['10:00', '10:30', '11:00', '11:30'],
    },
    {
      name: 'Tarde',
      slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
    },
    {
      name: 'Noche',
      slots: ['18:00', '18:30', '19:00', '19:30'],
    },
  ];

  // Filtrar horarios ocupados
  const isAvailable = (time) => !bookedTimes.includes(time);

  return (
    <div>
      <h3 className="text-barber-white font-semibold mb-3">Selecciona una hora</h3>

      <div className="space-y-4">
        {periods.map((period) => {
          const availableSlots = period.slots.filter(isAvailable);

          // No mostrar período si no hay horarios disponibles
          if (availableSlots.length === 0) return null;

          return (
            <div key={period.name}>
              {/* Nombre del período */}
              <h4 className="text-barber-gray text-sm font-medium mb-2">
                {period.name}
              </h4>

              {/* Grid de horarios */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => onTimeSelect(time)}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        selectedTime === time
                          ? 'bg-barber-blue text-white shadow-lg shadow-barber-blue/30'
                          : 'bg-barber-dark text-barber-gray hover:bg-barber-blue/20 hover:text-barber-white'
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay horarios */}
      {periods.every((p) => p.slots.filter(isAvailable).length === 0) && (
        <div className="text-center py-8">
          <p className="text-barber-gray">No hay horarios disponibles para esta fecha</p>
        </div>
      )}
    </div>
  );
}
