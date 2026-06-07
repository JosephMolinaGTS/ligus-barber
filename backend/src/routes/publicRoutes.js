const express = require('express');
const router = express.Router();
const { getPublicBranches } = require('../controllers/branchController');
const { getPublicServices } = require('../controllers/serviceController');
const { getPublicProducts } = require('../controllers/productController');

// -----------------------------------------------------------
// Rutas públicas (sin autenticación)
// Para la landing page y catálogos públicos.
// -----------------------------------------------------------
router.get('/branches', getPublicBranches);
router.get('/services', getPublicServices);
router.get('/products', getPublicProducts);

module.exports = router;
