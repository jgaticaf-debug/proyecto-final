const { Router } = require('express');
const { body } = require('express-validator');
const { registro, login } = require('../controladores/authControlador');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');

const router = Router();

router.post(
  '/registro',
  verificarToken,
  verificarRol('admin'),
  [
    body('nombre').notEmpty().trim().withMessage('El nombre es requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
    body('rol').optional().isIn(['usuario', 'agente', 'admin']).withMessage('Rol inválido'),
  ],
  registro
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  login
);

module.exports = router;
