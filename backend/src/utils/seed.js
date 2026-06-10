const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// ============================================================
// Seed Script — Datos de prueba para LIGUS BARBER
// Ejecutar con: npm run seed (no borra datos existentes)
//               npm run seed:reset (borra todo y recrea)
// ============================================================
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seeding...\n');

    const isReset = process.argv.includes('--reset');

    if (isReset) {
      // Modo reset: borrar todo y recrear
      console.log('🗑️  Modo RESET: borrando todos los datos...\n');
      await User.deleteMany({});
      await Branch.deleteMany({});
      await Service.deleteMany({});
      await Product.deleteMany({});
      await Appointment.deleteMany({});
      console.log('✅ Base de datos limpiada\n');
    } else {
      // Modo normal: no borrar, solo agregar si está vacío
      const existingBranches = await Branch.countDocuments();
      if (existingBranches > 0) {
        console.log('⚠️  Ya existen datos en la base de datos. Saltando seed...');
        console.log('   Si querés resetear, ejecutá: npm run seed:reset\n');
        process.exit(0);
      }
      console.log('📝 Base de datos vacía, creando datos iniciales...\n');
    }

    // -----------------------------------------------------------
    // 1. Crear Sucursales
    // -----------------------------------------------------------
    const branches = await Branch.insertMany([
      {
        name: 'LIGUS Centro',
        address: 'Pascual Orozco 1117, Culiacán Rosales, Sinaloa, México',
        phone: '667 234 5678',
        schedule: { open: '10:00', close: '20:00', days: [1, 2, 3, 4, 5, 6, 0] },
        image: '/images/LIGUS Centro.jpg',
      },
      {
        name: 'LIGUS Norte',
        address: 'Fraternidad 1572, Culiacán Rosales, Sinaloa, México',
        phone: '667 345 6789',
        schedule: { open: '10:00', close: '20:00', days: [1, 2, 3, 4, 5, 6, 0] },
        image: '/images/LIGUS Norte.png',
      },
    ]);
    console.log('🏢 Sucursales creadas:', branches.map((b) => b.name).join(', '));

    // -----------------------------------------------------------
    // 2. Crear Dueño
    // -----------------------------------------------------------
    const owner = await User.create({
      name: 'Dueño LIGUS',
      email: 'duenoligus@gmail.com',
      password: 'Ligus2024!',
      phone: '667 123 4567',
      role: 'owner',
    });
    console.log('👤 Dueño creado: duenoligus@gmail.com / Ligus2024!');

    // -----------------------------------------------------------
    // 3. Crear Administrador de sucursal
    // -----------------------------------------------------------
    const adminCentro = await User.create({
      name: 'Admin Centro',
      email: 'admincentro@gmail.com',
      password: 'Admin2024!',
      phone: '667 234 5678',
      role: 'admin',
      branch: branches[0]._id,
    });
    console.log('👤 Admin Centro creado: admincentro@gmail.com / Admin2024!');

    const adminNorte = await User.create({
      name: 'Admin Norte',
      email: 'adminnorte@gmail.com',
      password: 'AdminNorte2024!',
      phone: '667 345 6789',
      role: 'admin',
      branch: branches[1]._id,
    });
    console.log('👤 Admin Norte creado: adminnorte@gmail.com / AdminNorte2024!');

    // -----------------------------------------------------------
    // 4. Crear Barberos (3 por sucursal)
    // -----------------------------------------------------------
    const barbersData = [
      // Sucursal Centro
      {
        name: 'Carlos Rodríguez',
        email: 'rodcarlos@gmail.com',
        password: 'Barber2024a!',
        phone: '667 345 6789',
        role: 'barber',
        branch: branches[0]._id,
      },
      {
        name: 'Martín López',
        email: 'lopmartin@gmail.com',
        password: 'Barber2024b!',
        phone: '667 456 7890',
        role: 'barber',
        branch: branches[0]._id,
      },
      {
        name: 'Pablo Fernández',
        email: 'ferpablo@gmail.com',
        password: 'Barber2024c!',
        phone: '667 567 8901',
        role: 'barber',
        branch: branches[0]._id,
      },
      // Sucursal Norte
      {
        name: 'Diego García',
        email: 'gardiego@gmail.com',
        password: 'Barber2024d!',
        phone: '667 678 9012',
        role: 'barber',
        branch: branches[1]._id,
      },
      {
        name: 'Andrés Martínez',
        email: 'marandres@gmail.com',
        password: 'Barber2024e!',
        phone: '667 789 0123',
        role: 'barber',
        branch: branches[1]._id,
      },
      {
        name: 'Lucas Sánchez',
        email: 'sanlucas@gmail.com',
        password: 'Barber2024f!',
        phone: '667 890 1234',
        role: 'barber',
        branch: branches[1]._id,
      },
    ];

    // insertMany NO ejecuta pre-save hooks, así que hasheamos manualmente
    const SALT_ROUNDS = 12;
    const hashedBarbers = await Promise.all(
      barbersData.map(async (b) => ({
        ...b,
        password: await bcrypt.hash(b.password, SALT_ROUNDS),
      }))
    );
    const barbers = await User.insertMany(hashedBarbers);
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
        email: 'perjuan@gmail.com',
        password: 'Client2024!',
        phone: '667 901 2345',
        role: 'client',
      },
      {
        name: 'María González',
        email: 'gonzmaria@gmail.com',
        password: 'Client2024b!',
        phone: '667 012 3456',
        role: 'client',
      },
      {
        name: 'Roberto Díaz',
        email: 'diazroberto@gmail.com',
        password: 'Client2024c!',
        phone: '667 111 2233',
        role: 'client',
      },
      {
        name: 'Ana Torres',
        email: 'torana@gmail.com',
        password: 'Client2024d!',
        phone: '667 222 3344',
        role: 'client',
      },
      {
        name: 'Carlos Ruiz',
        email: 'ruicarlos@gmail.com',
        password: 'Client2024e!',
        phone: '667 333 4455',
        role: 'client',
      },
      {
        name: 'Demo User',
        email: 'demo@demo.com',
        password: 'Demo1234',
        phone: '667 123 4567',
        role: 'client',
      },
    ];

    // insertMany NO ejecuta pre-save hooks, así que hasheamos manualmente
    const hashedClients = await Promise.all(
      clientsData.map(async (c) => ({
        ...c,
        password: await bcrypt.hash(c.password, SALT_ROUNDS),
      }))
    );
    const clients = await User.insertMany(hashedClients);
    console.log(
      '👤 Clientes creados:',
      clients.map((c) => c.name).join(', ')
    );

    // -----------------------------------------------------------
    // 6. Crear Servicios (todos en ambas sucursales)
    // -----------------------------------------------------------
    const servicesData = [
      {
        name: 'Corte Ligus',
        description: 'Lavado de cabello, toalla caliente, masaje relajante con máquina, crema hidratante, secado y peinado.',
        price: 210,
        duration: 30,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Corte Niño',
        description: 'Se realiza el corte de cabello deseado ya sea con máquina o tijera marcando muy bien todo el contorno.',
        price: 180,
        duration: 30,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Arreglo de Barba',
        description: 'Se recorta y alinea la barba para posteriormente aplicar crema de afeitar, toalla caliente, afeitar con navaja, after-shave, toalla fría, masaje relajante con máquina, crema y aceite hidratante.',
        price: 210,
        duration: 30,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Barba y Tinte',
        description: 'Arreglo completo de barba más aplicación de tinte para cubrir canas o dar un look más definido.',
        price: 340,
        duration: 30,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Contornos',
        description: 'Se marca todo el contorno del corte dando un toque más fresco y una apariencia de un corte reciente.',
        price: 100,
        duration: 10,
        branches: [branches[0]._id, branches[1]._id],
        barbers: barbers.map((b) => b._id),
      },
      {
        name: 'Contornos y Barba',
        description: 'Contornos del corte más arreglo completo de barba con todos los ingredientes.',
        price: 310,
        duration: 30,
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
    // 7. Crear Productos (disponibles en ambas sucursales)
    // -----------------------------------------------------------
    const allBranchIds = branches.map((b) => b._id);

    const productsData = [
      {
        name: 'Pomada Matte',
        description: 'Fijación fuerte con acabado mate. Ideal para estilos formales.',
        price: 850,
        category: 'pomadas',
        stock: 25,
        branches: allBranchIds,
        image: '/images/Pomada Matte.jpeg',
        isPromoted: true,
      },
      {
        name: 'Cera Texturizadora',
        description: 'Cera para dar textura y volumen con acabado natural.',
        price: 750,
        category: 'ceras',
        stock: 30,
        branches: allBranchIds,
        image: '/images/Cera texturizadora.jpeg',
        isPromoted: false,
      },
      {
        name: 'Shampoo Anticaspa',
        description: 'Shampoo profesional con fórmula anticaspa.',
        price: 600,
        category: 'shampoo',
        stock: 40,
        branches: allBranchIds,
        image: '/images/Shampoo Anticaspa.jpeg',
        isPromoted: true,
      },
      {
        name: 'Aceite de Barba Premium',
        description: 'Aceite natural para barba suave y brillante.',
        price: 950,
        category: 'aceites',
        stock: 20,
        branches: allBranchIds,
        image: '/images/Aceite de Barba Premium.jpeg',
        isPromoted: true,
      },
      {
        name: 'After Shave',
        description: 'After shave refrescante con aroma a madera.',
        price: 700,
        category: 'after-shave',
        stock: 35,
        branches: allBranchIds,
        image: '/images/After Shave.jpeg',
        isPromoted: false,
      },
      {
        name: 'Peine de Madera',
        description: 'Peine artesanal de madera de sándalo.',
        price: 450,
        category: 'peines',
        stock: 50,
        branches: allBranchIds,
        image: '/images/Peine de Madera.jpeg',
        isPromoted: false,
      },
      {
        name: 'Kit Cuidado Personal',
        description: 'Kit completo: pomada + aceite + peine.',
        price: 2200,
        category: 'kits',
        stock: 15,
        branches: allBranchIds,
        image: '/images/Kit Cuidado Personal.jpeg',
        isPromoted: true,
      },
      {
        name: 'Pomada Clásica Hold',
        description: 'Fijación media con brillo clásico.',
        price: 650,
        category: 'pomadas',
        stock: 30,
        branches: allBranchIds,
        image: '/images/Pomada Clásica Hold.jpeg',
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
        service: services[0]._id, // Corte Ligus
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 5),
        time: '10:00',
        status: 'completed',
        price: 210,
      },
      {
        client: clients[1]._id,
        branch: branches[0]._id,
        service: services[2]._id, // Arreglo de Barba
        barber: barbers[1]._id,
        date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        time: '14:30',
        status: 'completed',
        price: 210,
      },
      {
        client: clients[2]._id,
        branch: branches[1]._id,
        service: services[4]._id, // Contornos
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
        service: services[2]._id, // Arreglo de Barba
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        time: '09:30',
        status: 'completed',
        price: 210,
      },
      {
        client: clients[3]._id,
        branch: branches[1]._id,
        service: services[0]._id, // Corte Ligus
        barber: barbers[4]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 3),
        time: '15:00',
        status: 'completed',
        price: 210,
      },
      // Citas pendientes
      {
        client: clients[1]._id,
        branch: branches[0]._id,
        service: services[3]._id, // Barba y Tinte
        barber: barbers[2]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        time: '11:00',
        status: 'pending',
        price: 340,
      },
      {
        client: clients[4]._id,
        branch: branches[1]._id,
        service: services[0]._id, // Corte Ligus
        barber: barbers[5]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        time: '16:00',
        status: 'pending',
        price: 210,
      },
      // Citas confirmadas
      {
        client: clients[2]._id,
        branch: branches[0]._id,
        service: services[2]._id, // Arreglo de Barba
        barber: barbers[1]._id,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        time: '10:30',
        status: 'confirmed',
        price: 210,
      },
      // Cita cancelada
      {
        client: clients[3]._id,
        branch: branches[0]._id,
        service: services[1]._id, // Corte Niño
        barber: barbers[0]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        time: '12:00',
        status: 'cancelled',
        price: 180,
      },
      // Más citas completadas
      {
        client: clients[4]._id,
        branch: branches[1]._id,
        service: services[5]._id, // Contornos y Barba
        barber: barbers[3]._id,
        date: new Date(now.getFullYear(), now.getMonth(), 4),
        time: '09:00',
        status: 'completed',
        price: 310,
      },
    ];

    await Appointment.insertMany(appointmentsData);
    console.log('📅 10 citas de prueba creadas');

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('   Dueño:        duenoligus@gmail.com   / Ligus2024!');
    console.log('   Admin Centro: admincentro@gmail.com  / Admin2024!');
    console.log('   Admin Norte:  adminnorte@gmail.com   / AdminNorte2024!');
    console.log('   Barbero:      rodcarlos@gmail.com    / Barber2024a!');
    console.log('   Cliente:      perjuan@gmail.com      / Client2024!');
    console.log('\n💡 Tip: npm run seed (no borra) | npm run seed:reset (borra todo)');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
};

// Export for API route usage
module.exports = { seedDatabase: seed };

// Run directly via CLI
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}
