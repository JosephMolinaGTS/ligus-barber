const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getPublicServices,
} = require('../controllers/serviceController');

// -----------------------------------------------------------
// Rutas protegidas (owner / admin)
// -----------------------------------------------------------
router.get(
  '/',
  protect,
  authorize('owner', 'admin'),
  getServices
);

router.get('/:id', protect, getService);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    body('duration')
      .isInt({ min: 5 })
      .withMessage('La duración mínima es 5 minutos'),
  ],
  validate,
  createService
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateService
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  deleteService
);

module.exports = router;
