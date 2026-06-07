// Configuración de JWT exportada desde variables de entorno
module.exports = {
  secret: process.env.JWT_SECRET,
  expire: process.env.JWT_EXPIRE || '7d',
};
