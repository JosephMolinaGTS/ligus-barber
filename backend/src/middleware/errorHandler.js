// ============================================================
// Middleware: Error Handler
// Maneja errores centralizadamente para todos los endpoints.
// Transforma errores de Mongoose y otros en respuestas consistentes.
// ============================================================
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para debugging en desarrollo
  console.error('🔥 Error:', err.message);

  // -----------------------------------------------------------
  // Error de validación de Mongoose (campos requeridos, etc.)
  // -----------------------------------------------------------
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages,
    });
  }

  // -----------------------------------------------------------
  // Error de duplicado (unique constraint violada)
  // -----------------------------------------------------------
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
    });
  }

  // -----------------------------------------------------------
  // Error de Cast (ObjectId inválido en parámetros)
  // -----------------------------------------------------------
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Recurso no encontrado con id: ${err.value}`,
    });
  }

  // -----------------------------------------------------------
  // Error JWT
  // -----------------------------------------------------------
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
  }

  // -----------------------------------------------------------
  // Error genérico
  // -----------------------------------------------------------
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
