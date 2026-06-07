const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

// -----------------------------------------------------------
// GET /api/dashboard
// Solo el dueño puede acceder a las métricas del negocio.
// -----------------------------------------------------------
router.get('/', protect, authorize('owner'), getDashboard);

module.exports = router;
