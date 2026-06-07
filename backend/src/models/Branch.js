const mongoose = require('mongoose');

// ============================================================
// Schema de Sucursal
// Representa cada local físico de LIGUS BARBER.
// ============================================================
const BranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la sucursal es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    address: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    schedule: {
      open: { type: String, default: '09:00' },  // Hora de apertura
      close: { type: String, default: '20:00' }, // Hora de cierre
      days: {
        type: [Number], // 0=Domingo, 1=Lunes, ..., 6=Sábado
        default: [1, 2, 3, 4, 5, 6], // Lunes a Sábado por defecto
        validate: {
          validator: (v) => v.every((d) => d >= 0 && d <= 6),
          message: 'Los días deben estar entre 0 (domingo) y 6 (sábado)',
        },
      },
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', BranchSchema);
