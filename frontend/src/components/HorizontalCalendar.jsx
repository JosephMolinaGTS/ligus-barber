import { useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ============================================================
// HorizontalCalendar — Calendario horizontal con navegación
// Muestra días disponibles y permite desplazarse entre fechas
// ============================================================
export default function HorizontalCalendar({ selectedDate, onDateSelect, availableDays = 14 }) {
  const scrollRef = useRef(null);

  // Generar array de días desde hoy
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < availableDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = generateDays();

  // Nombres de días en español
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Scroll horizontal
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Verificar si una fecha está seleccionada
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Es hoy
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="relative">
      {/* Título */}
      <h3 className="text-barber-white font-semibold mb-3">Selecciona una fecha</h3>

      <div className="flex items-center gap-2">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll('left')}
          className="flex-shrink-0 p-2 rounded-lg bg-barber-dark hover:bg-barber-blue/20 text-barber-gray hover:text-barber-blue transition-colors"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Calendario scrollable */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[70px]
                transition-all duration-200
                ${
                  isSelected(date)
                    ? 'bg-barber-blue text-white shadow-lg shadow-barber-blue/30'
                    : 'bg-barber-dark text-barber-gray hover:bg-barber-blue/20 hover:text-barber-white'
                }
              `}
            >
              <span className="text-xs font-medium">
                {dayNames[date.getDay()]}
              </span>
              <span className="text-2xl font-bold my-1">
                {date.getDate()}
              </span>
              <span className="text-xs">
                {monthNames[date.getMonth()]}
              </span>
              {isToday(date) && (
                <span className="w-1.5 h-1.5 rounded-full bg-barber-red mt-1" />
              )}
            </button>
          ))}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll('right')}
          className="flex-shrink-0 p-2 rounded-lg bg-barber-dark hover:bg-barber-blue/20 text-barber-gray hover:text-barber-blue transition-colors"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
