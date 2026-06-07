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
    const now = date ? new Date(date) : new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
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
    // Citas por mes (últimos 6 meses) para gráfica de barras
    // -----------------------------------------------------------
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentsByMonth = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Formatear datos para gráfica
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    const chartData = appointmentsByMonth.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      citas: item.count,
      ingresos: item.revenue,
    }));

    // -----------------------------------------------------------
    // Últimas 10 citas (para tabla de movimientos)
    // -----------------------------------------------------------
    const recentAppointments = await Appointment.find()
      .populate('client', 'name email')
      .populate('service', 'name')
      .populate('barber', 'name')
      .populate('branch', 'name')
      .sort({ createdAt: -1 })
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
