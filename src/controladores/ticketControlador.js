const { validationResult } = require('express-validator');
const Ticket = require('../modelos/Ticket');

const obtenerTickets = async (req, res) => {
  try {
    const filtros = {};
    if (req.usuario.rol === 'usuario') filtros.creadoPor = req.usuario.id;

    const tickets = await Ticket.find(filtros)
      .populate('creadoPor', 'nombre email')
      .populate('asignadoA', 'nombre email')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los tickets' });
  }
};

const obtenerTicketPorId = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('creadoPor', 'nombre email')
      .populate('asignadoA', 'nombre email')
      .populate('comentarios.autor', 'nombre email');

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el ticket' });
  }
};

const crearTicket = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { titulo, descripcion, prioridad, categoria, asignadoA } = req.body;

  try {
    const nuevoTicket = new Ticket({
      titulo,
      descripcion,
      prioridad,
      categoria,
      asignadoA: req.usuario.rol === 'admin' ? asignadoA : undefined,
      creadoPor: req.usuario.id,
    });

    await nuevoTicket.save();
    await nuevoTicket.populate('creadoPor', 'nombre email');

    res.status(201).json({ mensaje: 'Ticket creado exitosamente', ticket: nuevoTicket });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el ticket' });
  }
};

const actualizarTicket = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    if (req.usuario.rol === 'usuario' && ticket.creadoPor.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar este ticket' });
    }

    const camposPermitidos = ['titulo', 'descripcion', 'prioridad', 'categoria'];
    if (req.usuario.rol === 'admin') camposPermitidos.push('asignadoA');
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) ticket[campo] = req.body[campo];
    });

    await ticket.save();
    res.json({ mensaje: 'Ticket actualizado', ticket });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el ticket' });
  }
};

const actualizarEstado = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido', estadosValidos });
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    res.json({ mensaje: 'Estado actualizado', ticket });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado' });
  }
};

const eliminarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    res.json({ mensaje: 'Ticket eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el ticket' });
  }
};

const agregarComentario = async (req, res) => {
  const { texto } = req.body;
  if (!texto || !texto.trim()) {
    return res.status(400).json({ mensaje: 'El texto del comentario es requerido' });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    ticket.comentarios.push({ texto, autor: req.usuario.id });
    await ticket.save();
    await ticket.populate('comentarios.autor', 'nombre email');

    res.status(201).json({ mensaje: 'Comentario agregado', comentarios: ticket.comentarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar el comentario' });
  }
};

module.exports = {
  obtenerTickets,
  obtenerTicketPorId,
  crearTicket,
  actualizarTicket,
  actualizarEstado,
  eliminarTicket,
  agregarComentario,
};
