const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../modelos/Usuario');

const generarToken = (usuario) =>
  jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRETO, {
    expiresIn: process.env.JWT_EXPIRACION,
  });

const registro = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombre, email, password, rol } = req.body;

  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const nuevoUsuario = new Usuario({ nombre, email, password, rol });
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const passwordValido = await usuario.verificarContrasena(password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { registro, login };
