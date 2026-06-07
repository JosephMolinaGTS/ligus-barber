const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// ============================================================
// GET /api/appointments
// Listar todas las citas (con filtros por fecha, estado, barbero, sucursal).
// ============================================================
exports.getAppointments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      barber,
      branch,
      client,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (barber) query.barber = barber;
    if (branch) query.branch = branch;
    if (client) query.client = client;

    // Filtro por rango de fechas
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'name price duration')
      .populate('barber', 'name')
      .populate('branch', 'name')
      .sort({ date: -1, time: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: appointments,
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
// GET /api/appointments/mine
// Obtener las citas del usuario actual.
// - Client: sus propias citas
// - Barber: citas asignadas a él
// - Admin: citas de su sucursal
// ============================================================
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'barber') {
      query.barber = req.user._id;
    } else if (req.user.role === 'admin') {
      query.branch = req.user.branch;
    }
    // owner ve todas (sin filtro)

    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'name price duration')
      .populate('barber', 'name')
      .populate('branch', 'name')
      .sort({ date: -1, time: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: appointments,
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
// GET /api/appointments/:id
// Obtener una cita por ID.
// ============================================================
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('service', 'name price duration')
      .populate('barber', 'name email')
      .populate('branch', 'name address');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/appointments
// Crear una nueva cita. Verifica que no haya conflicto de horario
// para el barbero en esa fecha y hora.
// Soporta guest booking (sin autenticación)
// ============================================================
exports.createAppointment = async (req, res, next) => {
  try {
    const { client, branch, service, barber, date, time, notes, guestName, guestPhone, observations } = req.body;

    // Verificar que el barbero no tenga otra cita en ese horario
    const conflicting = await Appointment.findOne({
      barber,
      date: new Date(date),
      time,
      status: { $nin: ['cancelled'] },
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: 'El barbero ya tiene una cita en ese horario',
      });
    }

    // Obtener el precio del servicio
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    // Determinar el client ID
    // Si hay usuario autenticado, usar su ID
    // Si es guest, client puede ser null
    const clientId = req.user ? req.user._id : client || null;

    const appointmentData = {
      client: clientId,
      branch,
      service,
      barber,
      date: new Date(date),
      time,
      price: serviceData.price,
      notes: observations || notes,
    };

    // Si es guest booking, guardar datos de contacto
    if (guestName) {
      appointmentData.guestName = guestName;
    }
    if (guestPhone) {
      appointmentData.guestPhone = guestPhone;
    }

    const appointment = await Appointment.create(appointmentData);

    const populated = await appointment
      .populate([
        { path: 'client', select: 'name email' },
        { path: 'service', select: 'name price duration' },
        { path: 'barber', select: 'name' },
        { path: 'branch', select: 'name' },
      ]);

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Cita creada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/appointments/:id
// Actualizar una cita (fecha, hora, estado, etc.).
// ============================================================
exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('client', 'name email')
      .populate('service', 'name price')
      .populate('barber', 'name')
      .populate('branch', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Cita actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PATCH /api/appointments/:id/cancel
// Cancelar una cita.
// ============================================================
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está cancelada',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una cita completada',
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Cita cancelada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/appointments/available-slots
// Obtener horarios disponibles para un barbero en una fecha específica.
// Params: barber, service, date
// ============================================================
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { barber, service, date } = req.query;

    if (!barber || !service || !date) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren barber, service y date',
      });
    }

    // Obtener duración del servicio
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    const duration = serviceData.duration; // en minutos

    // Obtener todas las citas del barbero en esa fecha
    const existingAppointments = await Appointment.find({
      barber,
      date: new Date(date),
      status: { $nin: ['cancelled'] },
    }).select('time service');

    // Para cada cita existente, obtener su duración
    const busySlots = [];
    for (const apt of existingAppointments) {
      const aptService = await Service.findById(apt.service);
      const aptDuration = aptService ? aptService.duration : 30;

      // Convertir hora "HH:MM" a minutos desde medianoche
      const [hours, minutes] = apt.time.split(':').map(Number);
      const startMin = hours * 60 + minutes;
      const endMin = startMin + aptDuration;

      busySlots.push({ start: startMin, end: endMin });
    }

    // Generar slots disponibles de 30 en 30 minutos
    // Horario de 9:00 a 20:00
    const allSlots = [];
    for (let hour = 9; hour < 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = hour * 60 + min;
        const slotEnd = slotStart + duration;

        // Solo agregar si el slot cabe antes de las 20:00 (1200 min)
        if (slotEnd <= 20 * 60) {
          const isAvailable = !busySlots.some(
            (busy) => slotStart < busy.end && slotEnd > busy.start
          );

          if (isAvailable) {
            const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            allSlots.push(timeStr);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: allSlots,
    });
  } catch (error) {
    next(error);
  }
};
