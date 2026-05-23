const Usuario = require('../modelos/Usuario');

const obtenerUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    const filtro = rol ? { rol } : {};
    const usuarios = await Usuario.find(filtro).select('_id nombre email rol');
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
  }
};

module.exports = { obtenerUsuarios };
