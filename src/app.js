require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarBD = require('./config/baseDatos');
const { configurarSwagger } = require('./config/swagger');
const rutasAuth = require('./rutas/auth');
const rutasTickets = require('./rutas/tickets');
const rutasUsuarios = require('./rutas/usuarios');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

conectarBD();
configurarSwagger(app);

app.use('/api/auth', rutasAuth);
app.use('/api/tickets', rutasTickets);
app.use('/api/usuarios', rutasUsuarios);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Control de Tickets', docs: `http://localhost:${PUERTO}/api-docs` });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
  console.log(`Documentación Swagger: http://localhost:${PUERTO}/api-docs`);
});
