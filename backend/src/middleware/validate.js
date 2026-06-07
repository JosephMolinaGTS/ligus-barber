const { validationResult } = require('express-validator');

// ============================================================
// Middleware: Validate
// Verifica si express-validator encontró errores de validación.
// Si los hay, retorna 400 con los detalles.
// ============================================================
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
