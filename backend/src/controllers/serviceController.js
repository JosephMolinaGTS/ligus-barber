const Service = require('../models/Service');

// ============================================================
// GET /api/services
// Listar servicios (con paginación, búsqueda y filtro por sucursal).
// ============================================================
exports.getServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', branch = '' } = req.query;
    const query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (branch) {
      query.branches = branch;
    }

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('branches', 'name')
      .populate('barbers', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: services,
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
// GET /api/services/:id
// Obtener un servicio por ID.
// ============================================================
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('branches', 'name')
      .populate('barbers', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/services
// Crear un servicio nuevo (solo owner/admin).
// ============================================================
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service,
      message: 'Servicio creado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/services/:id
// Actualizar un servicio (solo owner/admin).
// ============================================================
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
      message: 'Servicio actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/services/:id
// Eliminar (desactivar) un servicio (solo owner).
// ============================================================
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Servicio eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/public/services
// Listar servicios públicos (sin auth, solo activos).
// ============================================================
exports.getPublicServices = async (req, res, next) => {
  try {
    const { branch = '', search = '' } = req.query;
    const query = { isActive: true };

    if (branch) query.branches = branch;
    if (search) query.name = { $regex: search, $options: 'i' };

    const services = await Service.find(query)
      .populate('branches', 'name')
      .populate('barbers', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
