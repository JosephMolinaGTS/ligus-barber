const mongoose = require('mongoose');

// ============================================================
// Schema de Producto
// Productos disponibles a la venta en cada sucursal.
// ============================================================
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
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
    category: {
      type: String,
      enum: [
        'pomadas',
        'ceras',
        'shampoo',
        'aceites',
        'after-shave',
        'peines',
        'kits',
        'otros',
      ],
      default: 'otros',
    },
    image: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    // Sucursal donde se vende
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'La sucursal es obligatoria'],
    },
    // Indicador de producto promocionado (aparece en landing)
    isPromoted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
