const express = require('express');
const cors = require('cors');
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
app.use(cors()); // Permitir requests del frontend
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
// -----------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
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
