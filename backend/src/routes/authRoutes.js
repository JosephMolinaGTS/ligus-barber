const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

// -----------------------------------------------------------
// POST /api/auth/register
// -----------------------------------------------------------
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  register
);

// -----------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validate,
  login
);

// -----------------------------------------------------------
// GET /api/auth/me — Obtener usuario actual
// -----------------------------------------------------------
router.get('/me', protect, getMe);

// -----------------------------------------------------------
// PUT /api/auth/me — Actualizar perfil
// -----------------------------------------------------------
router.put('/me', protect, updateProfile);

// -----------------------------------------------------------
// PUT /api/auth/change-password — Cambiar contraseña
// -----------------------------------------------------------
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  changePassword
);

module.exports = router;
