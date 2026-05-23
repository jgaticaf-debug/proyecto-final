const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'No se agrego el token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETO);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

const verificarRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
  }
  next();
};

module.exports = { verificarToken, verificarRol };
