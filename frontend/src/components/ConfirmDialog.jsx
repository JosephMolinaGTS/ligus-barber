import Modal from './Modal';

// ============================================================
// ConfirmDialog — Diálogo de confirmación para eliminar
// Props: isOpen, onClose, onConfirm, title, message
// ============================================================
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-barber-gray text-sm mb-6">{message}</p>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-barber-dark text-barber-gray rounded-lg hover:bg-barber-dark text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 bg-barber-red hover:bg-barber-red-dark text-white rounded-lg text-sm font-medium transition-colors"
        >
          Eliminar
        </button>
      </div>
    </Modal>
  );
}
