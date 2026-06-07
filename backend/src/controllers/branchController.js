const Branch = require('../models/Branch');

// ============================================================
// GET /api/branches
// Listar todas las sucursales (con paginación y búsqueda).
// ============================================================
exports.getBranches = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Branch.countDocuments(query);
    const branches = await Branch.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: branches,
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
// GET /api/branches/:id
// Obtener una sucursal por ID.
// ============================================================
exports.getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/branches
// Crear una nueva sucursal (solo owner/admin).
// ============================================================
exports.createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);

    res.status(201).json({
      success: true,
      data: branch,
      message: 'Sucursal creada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/branches/:id
// Actualizar una sucursal (solo owner/admin).
// ============================================================
exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
      message: 'Sucursal actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/branches/:id
// Eliminar (desactivar) una sucursal (solo owner).
// ============================================================
exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sucursal eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/public/branches
// Listar sucursales públicas (sin autenticación).
// ============================================================
exports.getPublicBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};
