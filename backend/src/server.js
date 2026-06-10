const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Cargar variables de entorno
require('dotenv').config();

// Conectar a MongoDB
connectDB();

const app = express();

// -----------------------------------------------------------
// Middleware globales
// -----------------------------------------------------------
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // Parsear JSON en el body

// -----------------------------------------------------------
// Rutas de la API
// -----------------------------------------------------------

// Auth (login, register, perfil)
app.use('/api/auth', require('./routes/authRoutes'));

// Sucursales (protegidas)
app.use('/api/branches', require('./routes/branchRoutes'));

// Servicios (protegidos)
app.use('/api/services', require('./routes/serviceRoutes'));

// Empleados (protegidos)
app.use('/api/employees', require('./routes/employeeRoutes'));

// Clientes (protegidos)
app.use('/api/clients', require('./routes/clientRoutes'));

// Citas (protegidas)
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Productos (protegidos)
app.use('/api/products', require('./routes/productRoutes'));

// Dashboard (solo owner)
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Rutas públicas (sin auth)
app.use('/api/public', require('./routes/publicRoutes'));

// -----------------------------------------------------------
// Servir archivos estáticos del frontend en producción
// (solo si el frontend está compilado junto al backend)
// -----------------------------------------------------------
const fs = require('fs');
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// -----------------------------------------------------------
// Ruta base — Health check
// -----------------------------------------------------------
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'LIGUS BARBER API funcionando correctamente',
    version: '1.0.0',
  });
});

// -----------------------------------------------------------
// Error handler global (debe ir al final de todas las rutas)
// -----------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------
// Iniciar servidor
// -----------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor LIGUS BARBER corriendo en puerto ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
