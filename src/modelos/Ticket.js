const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 200 },
    descripcion: { type: String, required: true },
    estado: {
      type: String,
      enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'],
      default: 'abierto',
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'critica'],
      default: 'media',
    },
    categoria: { type: String, trim: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    comentarios: [comentarioSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
