const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getPublicBranches,
} = require('../controllers/branchController');

// -----------------------------------------------------------
// Rutas protegidas (owner / admin)
// -----------------------------------------------------------
router.get(
  '/',
  protect,
  authorize('owner', 'admin'),
  getBranches
);

router.get(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  getBranch
);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('address').notEmpty().withMessage('La dirección es obligatoria'),
    body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
  ],
  validate,
  createBranch
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateBranch
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  deleteBranch
);

module.exports = router;
