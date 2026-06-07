const mongoose = require('mongoose');

// ============================================================
// Schema de Cita (Appointment)
// Representa una reserva de servicio con barbero en una sucursal.
// Soporta guest booking (sin cuenta de usuario)
// ============================================================
const AppointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // No es requerido para permitir guest booking
    },
    guestName: {
      type: String,
      trim: true,
      // Nombre del cliente invitado (sin cuenta)
    },
    guestPhone: {
      type: String,
      trim: true,
      // Teléfono del cliente invitado (sin cuenta)
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'La sucursal es obligatoria'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'El servicio es obligatorio'],
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El barbero es obligatorio'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    time: {
      type: String, // Formato "HH:MM" (ej. "10:30")
      required: [true, 'La hora es obligatoria'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Índice compuesto para evitar doble booking en el mismo horario
// Un barbero no puede tener dos citas en la misma fecha y hora
AppointmentSchema.index({ barber: 1, date: 1, time: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
