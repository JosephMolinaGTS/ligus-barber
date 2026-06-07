const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  getMyAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
} = require('../controllers/appointmentController');

// -----------------------------------------------------------
// Todas las rutas de citas requieren autenticación
// -----------------------------------------------------------

// Obtener horarios disponibles
router.get('/available-slots', protect, getAvailableSlots);

// Obtener mis citas (filtrado por rol automáticamente)
router.get('/mine', protect, getMyAppointments);

// Listar todas las citas (con filtros)
router.get('/', protect, getAppointments);

// Obtener una cita por ID
router.get('/:id', protect, getAppointment);

// Crear una cita
router.post('/', protect, createAppointment);

// Actualizar una cita
router.put('/:id', protect, updateAppointment);

// Cancelar una cita
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
