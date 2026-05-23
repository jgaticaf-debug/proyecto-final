const { Router } = require('express');
const { body } = require('express-validator');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');
const {
  obtenerTickets,
  obtenerTicketPorId,
  crearTicket,
  actualizarTicket,
  actualizarEstado,
  eliminarTicket,
  agregarComentario,
} = require('../controladores/ticketControlador');

const router = Router();

router.use(verificarToken);

router.get('/', obtenerTickets);
router.get('/:id', obtenerTicketPorId);

router.post(
  '/',
  [
    body('titulo').notEmpty().trim().withMessage('El título es requerido'),
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']).withMessage('Prioridad inválida'),
    body('asignadoA').optional().isMongoId().withMessage('ID de usuario inválido'),
  ],
  crearTicket
);

router.put(
  '/:id',
  [
    body('titulo').optional().notEmpty().trim().withMessage('El título no puede estar vacío'),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']).withMessage('Prioridad inválida'),
    body('asignadoA').optional().isMongoId().withMessage('ID de usuario inválido'),
  ],
  actualizarTicket
);

router.patch('/:id/estado', verificarRol('agente', 'admin'), actualizarEstado);
router.delete('/:id', verificarRol('admin'), eliminarTicket);
router.post('/:id/comentarios', agregarComentario);

module.exports = router;
