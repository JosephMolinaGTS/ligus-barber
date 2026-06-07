const User = require('../models/User');

// ============================================================
// POST /api/auth/register
// Registrar un nuevo usuario. Retorna token JWT.
// ============================================================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese correo',
      });
    }

    // Crear usuario (solo permitimos crear como client por defecto)
    // El owner puede crear usuarios con otros roles después
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'client',
    });

    // Generar token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/auth/login
// Iniciar sesión. Valida credenciales y retorna token JWT.
// ============================================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese email y contraseña',
      });
    }

    // Buscar usuario y traer password (select: false por defecto)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada — contacte al administrador',
      });
    }

    // Generar token
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/auth/me
// Obtener el usuario actual (requiere autenticación).
// ============================================================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('branch', 'name');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/auth/me
// Actualizar perfil del usuario actual.
// ============================================================
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/auth/change-password
// Cambiar contraseña del usuario actual.
// ============================================================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verificar que la contraseña actual sea correcta
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    user.password = newPassword;
    await user.save(); // El pre-save hook hashea automáticamente

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      data: { token },
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};
