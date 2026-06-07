const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

// ============================================================
// Middleware: Protect
// Verifica el token JWT del header Authorization.
// Si es válido, busca el usuario y lo adjunta a req.user.
// ============================================================
const protect = async (req, res, next) => {
  let token;

  // El header viene como "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado — token no proporcionado',
    });
  }

  try {
    // Verificar que el token sea válido
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Buscar el usuario y adjuntarlo a req (sin password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado — usuario no encontrado',
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada — contacte al administrador',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado — token inválido o expirado',
    });
  }
};

// ============================================================
// Middleware: Authorize (role-based access control)
// Factory que retorna un middleware que verifica el rol del usuario.
// Uso: authorize('owner', 'admin') — permite solo owner y admin.
// ============================================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol '${req.user.role}' no tiene permiso para esta acción`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
