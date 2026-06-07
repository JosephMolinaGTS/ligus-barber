const User = require('../models/User');
const Appointment = require('../models/Appointment');

// ============================================================
// GET /api/clients
// Listar clientes (con paginación y búsqueda).
// ============================================================
exports.getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = { role: 'client', isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const clients = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Contar citas por cliente
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const appointmentCount = await Appointment.countDocuments({
          client: client._id,
        });
        return {
          ...client.toObject(),
          appointmentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: clientsWithStats,
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
// GET /api/clients/:id
// Obtener un cliente con su historial de citas.
// ============================================================
exports.getClient = async (req, res, next) => {
  try {
    const client = await User.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    // Obtener historial de citas
    const appointments = await Appointment.find({ client: client._id })
      .populate('service', 'name price')
      .populate('barber', 'name')
      .populate('branch', 'name')
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: { ...client.toObject(), appointments },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/clients
// Crear un cliente nuevo.
// ============================================================
exports.createClient = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese correo',
      });
    }

    const client = await User.create({
      name,
      email,
      password: password || '123456', // Password por defecto
      phone,
      role: 'client',
    });

    res.status(201).json({
      success: true,
      data: {
        id: client._id,
        name: client.name,
        email: client.email,
      },
      message: 'Cliente creado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/clients/:id
// Actualizar un cliente.
// ============================================================
exports.updateClient = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    const client = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
      message: 'Cliente actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/clients/:id
// Desactivar un cliente (solo owner).
// ============================================================
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente desactivado correctamente',
    });
  } catch (error) {
    next(error);
  }
};
