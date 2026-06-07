import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

// ============================================================
// Modal — Componente modal reutilizable
// Props: isOpen, onClose, title, children, size (sm/md/lg)
// ============================================================
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tamaños del modal
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Contenido del modal */}
      <div
        className={`relative bg-barber-charcoal rounded-xl border border-barber-dark w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-barber-dark">
          <h3 className="text-barber-white text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-barber-gray hover:text-barber-white p-1"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
