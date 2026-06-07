const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

router.get(
  '/',
  protect,
  authorize('owner', 'admin'),
  getEmployees
);

router.get(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  getEmployee
);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  createEmployee
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateEmployee
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  deleteEmployee
);

module.exports = router;
