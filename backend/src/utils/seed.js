const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// ============================================================
// Seed Script — Datos de prueba para LIGUS BARBER
// Ejecutar con: npm run seed
// ============================================================
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seeding...\n');

    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Service.deleteMany({});
    await Product.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️  Base de datos limpiada\n');

    // -----------------------------------------------------------
    // 1. Crear Dueño
    // -----------------------------------------------------------
    const owner = await User.create({
      name: 'Dueño LIGUS',
      email: 'owner@ligus.com',
      password: '123456',
      phone: '11-1234-5678',
      role: 'owner',
    });
    console.log('👤 Dueño creado: owner@ligus.com / 123456');

    // -----------------------------------------------------------
    // 2. Crear Sucursales
    // -----------------------------------------------------------
    const branches = await Branch.insertMany([
      {
        name: 'LIGUS Centro',
        address: 'Av. Corrientes 1234, Buenos Aires',
        phone: '11-2345-6789',
        schedule: { open: '09:00', close: '20:00', days: [1, 2, 3, 4, 5, 6] },
      },
      {
        name: 'LIGUS Norte',
        address: 'Av. Santa Fe 5678, Buenos Aires',
        phone: '11-3456-7890',
        schedule: { open: '10:00', close: '21:00', days: [1, 2, 3, 4, 5, 6] },
      },
    ]);
    console.log('🏢 Sucursales creadas:', branches.map((b) => b.name).join(', '));

    // -----------------------------------------------------------
    // 3. Crear Administrador de sucursal
    // -----------------------------------------------------------
    const admin = await User.create({
      name: 'Admin Centro',
      email: 'admin@ligus.com',
      password: '123456',
      phone: '11-4567-8901',
      role: 'admin',
      branch: branches[0]._id,
    });
    console.log('👤 Admin creado: admin@ligus.com / 123456');

    // -----------------------------------------------------------
    // 4. Crear Barberos (3 por sucursal)
    // -----------------------------------------------------------
    const barbersData = [
      // Sucursal Centro
      {
        name: 'Carlos Rodríguez',
        email: 'carlos@ligus.com',
        password: '123456',
        phone: '11-5678-9012',
        role: 'barber',
        branch: branches[0]._id,
      },
      {
        name: 'Martín López',
        email: 'martin@ligus.com',
        password: '123456',
        phone: '11-6789-0123',
        role: 'barber',
        branch: branches[0]._id,
      },
      {
        name: 'Pablo Fernández',
        email: 'pablo@ligus.com',
        password: '123456',
        phone: '11-7890-1234',
        role: 'barber',
        branch: branches[0]._id,
      },
      // Sucursal Norte
      {
        name: 'Diego García',
        email: 'diego@ligus.com',
        password: '123456',
        phone: '11-8901-2345',
        role: 'barber',
        branch: branches[1]._id,
      },
      {
        name: 'Andrés Martínez',
        email: 'andres@ligus.com',
        password: '123456',
        phone: '11-9012-3456',
        role: 'barber',
        branch: branches[1]._id,
      },
      {
        name: 'Lucas Sánchez',
        email: 'lucas@ligus.com',
        password: '123456',
        phone: '11-0123-4567',
        role: 'barber',
        branch: branches[1]._id,
      },
    ];

    const barbers = await User.insertMany(barbersData);
    console.log(
      '✂️  Barberos creados:',
      barbers.map((b) => b.name).join(', ')
    );

    // -----------------------------------------------------------
    // 5. Crear Clientes de prueba
    // -----------------------------------------------------------
    const clientsData = [
      {
        name: 'Juan Pérez',
        email: 'juan@email.com',
        password: '123456',
        phone: '11-1111-2222',
        role: 'client',
      },
      {
        name: 'María González',
        email: 'maria@email.com',
        password: '123456',
        phone: '11-2222-3333',
        role: 'client',
      },
      {
        name: 'Roberto Díaz',
        email: 'roberto@email.com',
        password: '123456',
        phone: '11-3333-4444',
        role: 'client',
      },
      {
        name: 'Ana Torres',
        email: 'ana@email.com',
        password: '123456',
        phone: '11-4444-5555',
        role: 'client',
      },
      {
        name: 'Carlos Ruiz',
        email: 'carlos.r@email.com',
        password: '123456',
        phone: '11-5555-6666',
        role: 'client',
      },
    ];

    const clients = await User.insertMany(clientsData);
    console.log(
      '👤 Clientes creados:',
      clients.map((c) => c.name).join(', ')
    );

    // -----------------------------------------------------------
    // 6. Crear Servicios
    // -----------------------------------------------------------
    const servicesData = [
      {
        name: 'Corte de Cabello',
        description: 'Corte profesional masculino según tu estilo',
        price: 150,
        duration: 30,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Corte y Barba',
        description: 'Corte de cabello + perfilado y diseño de barba',
        price: 250,
        duration: 45,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Perfilado de Barba',
        description: 'Diseño y perfilado profesional de barba',
        price: 100,
        duration: 20,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Afeitado Clásico',
        description: 'Afeitado clásico con navaja y toalla caliente',
        price: 120,
        duration: 25,
        branches: [branches[0]._id],
        barbers: barbers.slice(0, 3).map((b) => b._id),
      },
      {
        name: 'Corte Infantil',
        description: 'Corte especial para niños con paciencia y onda',
        price: 100,
        duration: 20,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Diseño de Cejas',
        description: 'Diseño y perfilado de cejas profesional',
        price: 80,
        duration: 15,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
    ];

    const services = await Service.insertMany(servicesData);
    console.log(
      '💈 Servicios creados:',
      services.map((s) => s.name).join(', ')
    );

    // -----------------------------------------------------------
    // 7. Crear Productos
    // -----------------------------------------------------------
    const productsData = [
      {
        name: 'Pomada Matte LIGUS',
        description: 'Fijación fuerte con acabado mate. Ideal para estilos formales.',
        price: 850,
        category: 'pomadas',
        stock: 25,
        branch: branches[0]._id,
        isPromoted: true,
      },
      {
        name: 'Cera Texturizadora',
        description: 'Cera para dar textura y volumen con acabado natural.',
        price: 750,
        category: 'ceras',
        stock: 30,
        branch: branches[0]._id,
        isPromoted: false,
      },
      {
        name: 'Shampoo Anticaspa LIGUS',
        description: 'Shampoo profesional con fórmula anticaspa.',
        price: 600,
        category: 'shampoo',
        stock: 40,
        branch: branches[1]._id,
        isPromoted: true,
      },
      {
        name: 'Aceite de Barba Premium',
        description: 'Aceite natural para barba suave y brillante.',
        price: 950,
        category: 'aceites',
        stock: 20,
        branch: branches[0]._id,
        isPromoted: true,
      },
      {
        name: 'After Shave LIGUS',
        description: 'After shave refrescante con aroma a madera.',
        price: 700,
        category: 'after-shave',
        stock: 35,
        branch: branches[1]._id,
        isPromoted: false,
      },
      {
        name: 'Peine de Madera',
        description: 'Peine artesanal de madera de sándalo.',
        price: 450,
        category: 'peines',
        stock: 50,
        branch: branches[0]._id,
        isPromoted: false,
      },
      {
        name: 'Kit Cuidado Personal',
        description: 'Kit completo: pomada + aceite + peine.',
        price: 2200,
        category: 'kits',
        stock: 15,
        branch: branches[1]._id,
        isPromoted: true,
      },
      {
        name: 'Pomada Clásica Hold',
        description: 'Fijación media con brillo clásico.',
        price: 650,
        category: 'pomadas',
        stock: 30,
        branch: branches[1]._id,
        isPromoted: false,
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(
      '📦 Productos creados:',
      products.map((p) => p.name).join(', ')
    );

    // -----------------------------------------------------------
    // 8. Crear Citas de prueba
    // -----------------------------------------------------------
    const now = new Date();
    const appointmentsData = [
      // Citas completadas (mes pasado)
      {
        client: clients[0]._id,
        branch: branches[0]._id,
        service: services[0]._id, // Corte de Cabello
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 5),
        time: '10:00',
        status: 'completed',
        price: 150,
      },
      {
        client: clients[1]._id,
        branch: branches[0]._id,
        service: services[1]._id, // Corte y Barba
        barber: barbers[1]._id,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        time: '14:30',
        status: 'completed',
        price: 250,
      },
      {
        client: clients[2]._id,
        branch: branches[1]._id,
        service: services[2]._id, // Perfilado
        barber: barbers[3]._id,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        time: '11:00',
        status: 'completed',
        price: 100,
      },
      // Citas completadas (este mes)
      {
        client: clients[0]._id,
        branch: branches[0]._id,
        service: services[1]._id, // Corte y Barba
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        time: '09:30',
        status: 'completed',
        price: 250,
      },
      {
        client: clients[3]._id,
        branch: branches[1]._id,
        service: services[0]._id, // Corte
        barber: barbers[4]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        time: '15:00',
        status: 'completed',
        price: 150,
      },
      // Citas pendientes
      {
        client: clients[1]._id,
        branch: branches[0]._id,
        service: services[3]._id, // Afeitado
        barber: barbers[2]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        time: '11:00',
        status: 'pending',
        price: 120,
      },
      {
        client: clients[4]._id,
        branch: branches[1]._id,
        service: services[0]._id, // Corte
        barber: barbers[5]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        time: '16:00',
        status: 'pending',
        price: 150,
      },
      // Citas confirmadas
      {
        client: clients[2]._id,
        branch: branches[0]._id,
        service: services[1]._id, // Corte y Barba
        barber: barbers[1]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        time: '10:30',
        status: 'confirmed',
        price: 250,
      },
      // Cita cancelada
      {
        client: clients[3]._id,
        branch: branches[0]._id,
        service: services[4]._id, // Corte Infantil
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        time: '12:00',
        status: 'cancelled',
        price: 100,
      },
      // Más citas completadas
      {
        client: clients[4]._id,
        branch: branches[1]._id,
        service: services[5]._id, // Cejas
        barber: barbers[3]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 4),
        time: '09:00',
        status: 'completed',
        price: 80,
      },
    ];

    await Appointment.insertMany(appointmentsData);
    console.log('📅 10 citas de prueba creadas');

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('   Dueño:   owner@ligus.com  / 123456');
    console.log('   Admin:   admin@ligus.com  / 123456');
    console.log('   Barbero: carlos@ligus.com / 123456');
    console.log('   Cliente: juan@email.com   / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
};

seed();
