const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} - Error: ${error.message}`);
      if (i < retries - 1) {
        console.log(`🔄 Reintentando en 5 segundos...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  console.error('❌ No se pudo conectar a MongoDB después de varios intentos');
};

module.exports = connectDB;
