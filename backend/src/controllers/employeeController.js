const User = require('../models/User');

// ============================================================
// GET /api/employees
// Listar empleados (barberos y administradores).
// ============================================================
exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', branch = '' } = req.query;
    const query = { role: { $in: ['barber', 'admin'] }, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) {
      query.branch = branch;
    }

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('branch', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/employees/:id
// Obtener un empleado por ID.
// ============================================================
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).populate(
      'branch',
      'name address'
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/employees
// Crear un empleado nuevo (owner/admin).
// ============================================================
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, branch, specialty } = req.body;

    // Verificar que el email no esté en uso
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese correo',
      });
    }

    const employee = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'barber',
      branch,
      specialty,
    });

    res.status(201).json({
      success: true,
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
      message: 'Empleado creado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/employees/:id
// Actualizar un empleado (owner/admin).
// ============================================================
exports.updateEmployee = async (req, res, next) => {
  try {
    // No permitir cambiar password desde este endpoint
    const { password, ...updateData } = req.body;

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
      message: 'Empleado actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/employees/:id
// Desactivar un empleado (solo owner).
// ============================================================
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Empleado desactivado correctamente',
    });
  } catch (error) {
    next(error);
  }
};
