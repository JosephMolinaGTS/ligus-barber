const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

router.get(
  '/',
  protect,
  authorize('owner', 'admin'),
  getClients
);

router.get(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  getClient
);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
  ],
  validate,
  createClient
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateClient
);

router.delete(
  '/:id',
  protect,
  authorize('owner'),
  deleteClient
);

module.exports = router;
