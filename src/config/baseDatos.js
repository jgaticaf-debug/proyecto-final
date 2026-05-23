const mongoose = require('mongoose');

const crearAdminPorDefecto = async () => {
  const Usuario = require('../modelos/Usuario');
  const existe = await Usuario.findOne({ rol: 'admin' });
  if (!existe) {
    await Usuario.create({
      nombre: 'Administrador',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      rol: 'admin',
    });
    console.log(`Admin creado: ${process.env.ADMIN_EMAIL}`);
  }
};

const conectarBD = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexión a MongoDB exitosa');
    await crearAdminPorDefecto();
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = conectarBD;
