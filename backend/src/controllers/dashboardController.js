const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Service = require('../models/Service');

// ============================================================
// GET /api/dashboard
// Métricas del dashboard para el dueño.
// Acepta: period (day/month/year), date
// ============================================================
exports.getDashboard = async (req, res, next) => {
  try {
    const { period = 'month', date } = req.query;

    // Calcular rango de fechas según el período
    let startDate, endDate;
    let chartStartDate, chartEndDate;

    if (date) {
      // Parsear la fecha según el período
      if (period === 'day') {
        // date formato: YYYY-MM-DD
        const [year, month, day] = date.split('-').map(Number);
        startDate = new Date(year, month - 1, day);
        endDate = new Date(year, month - 1, day + 1);
        // Para gráfica: mostrar este día específico
        chartStartDate = startDate;
        chartEndDate = endDate;
      } else if (period === 'month') {
        // date formato: YYYY-MM
        const [year, month] = date.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 1);
        // Para gráfica: mostrar este mes específico
        chartStartDate = startDate;
        chartEndDate = endDate;
      } else if (period === 'year') {
        // date formato: YYYY
        const year = parseInt(date);
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        // Para gráfica: mostrar todos los meses del año
        chartStartDate = startDate;
        chartEndDate = endDate;
      }
    } else {
      // Sin fecha: usar fecha actual
      const now = new Date();
      if (period === 'day') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
      } else {
        // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      chartStartDate = startDate;
      chartEndDate = endDate;
    }

    // -----------------------------------------------------------
    // Métricas generales
    // -----------------------------------------------------------
    const totalAppointments = await Appointment.countDocuments({
      date: { $gte: startDate, $lt: endDate },
    });

    const completedAppointments = await Appointment.countDocuments({
      date: { $gte: startDate, $lt: endDate },
      status: 'completed',
    });

    const cancelledAppointments = await Appointment.countDocuments({
      date: { $gte: startDate, $lt: endDate },
      status: 'cancelled',
    });

    const pendingAppointments = await Appointment.countDocuments({
      date: { $gte: startDate, $lt: endDate },
      status: { $in: ['pending', 'confirmed'] },
    });

    // -----------------------------------------------------------
    // Ingresos por servicios (solo citas completadas)
    // -----------------------------------------------------------
    const revenueResult = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // -----------------------------------------------------------
    // Servicios más solicitados (top 5)
    // -----------------------------------------------------------
    const topServices = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $project: {
          name: '$service.name',
          count: 1,
          price: '$service.price',
        },
      },
    ]);

    // -----------------------------------------------------------
    // Barberos con más citas (top 5)
    // -----------------------------------------------------------
    const topBarbers = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: '$barber', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'barber',
        },
      },
      { $unwind: '$barber' },
      {
        $project: {
          name: '$barber.name',
          count: 1,
        },
      },
    ]);

    // -----------------------------------------------------------
    // Sucursales con mejor rendimiento
    // -----------------------------------------------------------
    const topBranches = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $project: {
          name: '$branch.name',
          count: 1,
        },
      },
    ]);

    // -----------------------------------------------------------
    // Total de clientes registrados
    // -----------------------------------------------------------
    const totalClients = await User.countDocuments({
      role: 'client',
      isActive: true,
    });

    // -----------------------------------------------------------
    // Citas por período para gráfica
    // -----------------------------------------------------------
    let chartData = [];

    if (period === 'year') {
      // Para año: mostrar citas por mes
      const appointmentsByMonth = await Appointment.aggregate([
        {
          $match: {
            date: { $gte: chartStartDate, $lt: chartEndDate },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0],
              },
            },
          },
        },
        { $sort: { '_id.month': 1 } },
      ]);

      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
      ];

      chartData = appointmentsByMonth.map((item) => ({
        name: monthNames[item._id.month - 1],
        citas: item.count,
        ingresos: item.revenue,
      }));
    } else if (period === 'month') {
      // Para mes: mostrar citas por día
      const appointmentsByDay = await Appointment.aggregate([
        {
          $match: {
            date: { $gte: chartStartDate, $lt: chartEndDate },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { day: { $dayOfMonth: '$date' } },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0],
              },
            },
          },
        },
        { $sort: { '_id.day': 1 } },
      ]);

      chartData = appointmentsByDay.map((item) => ({
        name: `Día ${item._id.day}`,
        citas: item.count,
        ingresos: item.revenue,
      }));
    } else {
      // Para día: mostrar citas por hora
      const appointmentsByHour = await Appointment.aggregate([
        {
          $match: {
            date: { $gte: chartStartDate, $lt: chartEndDate },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { hour: { $hour: '$date' } },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0],
              },
            },
          },
        },
        { $sort: { '_id.hour': 1 } },
      ]);

      chartData = appointmentsByHour.map((item) => ({
        name: `${item._id.hour}:00`,
        citas: item.count,
        ingresos: item.revenue,
      }));
    }

    // -----------------------------------------------------------
    // Últimas 10 citas (para tabla de movimientos)
    // -----------------------------------------------------------
    const recentAppointments = await Appointment.find({
      date: { $gte: startDate, $lt: endDate },
    })
      .populate('client', 'name email')
      .populate('service', 'name')
      .populate('barber', 'name')
      .populate('branch', 'name')
      .sort({ date: -1 })
      .limit(10);

    // -----------------------------------------------------------
    // Responder con todas las métricas
    // -----------------------------------------------------------
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          pendingAppointments,
          totalRevenue,
          totalClients,
        },
        topServices,
        topBarbers,
        topBranches,
        chartData,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
