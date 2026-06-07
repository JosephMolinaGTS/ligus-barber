const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// ============================================================
// Schema de Usuario
// Un solo modelo para dueño, administrador, barbero y cliente.
// El campo 'role' determina los permisos de cada usuario.
// ============================================================
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Correo electrónico inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // Por defecto no se retorna en queries
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'barber', 'client'],
      default: 'client',
    },
    // Sucursal asignada (aplica para admin y barbero)
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// -----------------------------------------------------------
// Hook pre-save: hashear contraseña antes de guardar
// Solo hashea si la contraseña fue modificada (nueva o cambiada)
// -----------------------------------------------------------
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// -----------------------------------------------------------
// Método de instancia: comparar contraseña ingresada con el hash
// -----------------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// -----------------------------------------------------------
// Método de instancia: generar JWT
// -----------------------------------------------------------
UserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expire,
  });
};

module.exports = mongoose.model('User', UserSchema);
