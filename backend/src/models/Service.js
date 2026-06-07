const mongoose = require('mongoose');

// ============================================================
// Schema de Servicio
// Servicios que ofrece la barbería (corte, barba, etc.)
// ============================================================
const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    duration: {
      type: Number, // Duración en minutos
      required: [true, 'La duración es obligatoria'],
      min: [5, 'La duración mínima es 5 minutos'],
    },
    image: {
      type: String,
    },
    // Sucursales donde está disponible este servicio
    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
      },
    ],
    // Barberos que pueden realizar este servicio
    barbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
