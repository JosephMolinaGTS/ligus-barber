const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
} = require('../controllers/productController');

router.get(
  '/',
  protect,
  authorize('owner', 'admin'),
  getProducts
);

router.get('/:id', protect, getProduct);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),
    body('branch').notEmpty().withMessage('La sucursal es obligatoria'),
  ],
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  deleteProduct
);

module.exports = router;
