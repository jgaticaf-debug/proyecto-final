const { Router } = require('express');
const { verificarToken } = require('../middlewares/autenticacion');
const { obtenerUsuarios } = require('../controladores/usuarioControlador');

const router = Router();

router.use(verificarToken);

router.get('/', obtenerUsuarios);

module.exports = router;
