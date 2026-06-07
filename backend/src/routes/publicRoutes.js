const express = require('express');
const router = express.Router();
const { getPublicBranches } = require('../controllers/branchController');
const { getPublicServices } = require('../controllers/serviceController');
const { getPublicProducts } = require('../controllers/productController');
const { createAppointment } = require('../controllers/appointmentController');
const User = require('../models/User');

// -----------------------------------------------------------
// Rutas públicas (sin autenticación)
// Para la landing page y catálogos públicos.
// -----------------------------------------------------------
router.get('/branches', getPublicBranches);
router.get('/services', getPublicServices);
router.get('/products', getPublicProducts);

// -----------------------------------------------------------
// Obtener barberos por sucursal (público)
// -----------------------------------------------------------
router.get('/barbers/:branchId', async (req, res) => {
  try {
    const barbers = await User.find({
      role: 'barber',
      branch: req.params.branchId,
      isActive: true,
    }).select('name phone');

    res.status(200).json({
      success: true,
      data: barbers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener barberos',
    });
  }
});

// -----------------------------------------------------------
// Crear cita sin autenticación (guest booking)
// -----------------------------------------------------------
router.post('/appointments', createAppointment);

module.exports = router;
