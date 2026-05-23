const swaggerUi = require('swagger-ui-express');

const especificacion = {
  openapi: '3.0.0',
  info: {
    title: 'API Control de Tickets',
    version: '1.0.0',
    description: 'Sistema de gestión y control de tickets de soporte técnico',
  },
  servers: [
    { url: 'https://proyecto-final-production-ce1b.up.railway.app', description: 'Railway' },
    { url: `http://localhost:${process.env.PUERTO || 3000}`, description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido al iniciar sesión. Formato: Bearer {token}',
      },
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64a1b2c3d4e5f6789012345a' },
          nombre: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          rol: { type: 'string', enum: ['usuario', 'agente', 'admin'], example: 'usuario' },
        },
      },
      Comentario: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          texto: { type: 'string', example: 'Estamos revisando el problema.' },
          autor: { $ref: '#/components/schemas/Usuario' },
          fechaCreacion: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          titulo: { type: 'string', example: 'Error al iniciar sesión' },
          descripcion: { type: 'string', example: 'El sistema no permite iniciar sesión.' },
          estado: { type: 'string', enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'] },
          prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'] },
          categoria: { type: 'string', example: 'Autenticación' },
          creadoPor: { $ref: '#/components/schemas/Usuario' },
          asignadoA: { $ref: '#/components/schemas/Usuario' },
          comentarios: { type: 'array', items: { $ref: '#/components/schemas/Comentario' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegistroRequest: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          password: { type: 'string', example: 'mi_password', minLength: 6 },
          rol: { type: 'string', enum: ['usuario', 'agente', 'admin'], default: 'usuario' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'juan@ejemplo.com' },
          password: { type: 'string', example: 'mi_password' },
        },
      },
      TicketRequest: {
        type: 'object',
        required: ['titulo', 'descripcion'],
        properties: {
          titulo: { type: 'string', example: 'Error al iniciar sesión' },
          descripcion: { type: 'string', example: 'Descripción detallada del problema.' },
          prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'], default: 'media' },
          categoria: { type: 'string', example: 'Autenticación' },
          asignadoA: { type: 'string', example: '64a1b2c3d4e5f6789012345a' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          mensaje: { type: 'string' },
          token: { type: 'string' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          mensaje: { type: 'string', example: 'Mensaje de error descriptivo' },
        },
      },
    },
    responses: {
      NoAutorizado: {
        description: 'Token no proporcionado o inválido',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'No se agregó el token' } },
        },
      },
      NoEncontrado: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'Ticket no encontrado' } },
        },
      },
      ErrorServidor: {
        description: 'Error interno del servidor',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'Error interno del servidor' } },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        parameters: [
          { name: 'rol', in: 'query', schema: { type: 'string', enum: ['usuario', 'agente', 'admin'] }, description: 'Filtrar por rol' },
        ],
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    usuarios: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Usuario' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/NoAutorizado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/auth/registro': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar nuevo usuario (solo admin)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroRequest' } } },
        },
        responses: {
          201: { description: 'Usuario registrado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Datos inválidos o email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'El email ya está registrado' } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { description: 'Sin permiso', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'No tienes permiso para realizar esta acción' } } } },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'Credenciales inválidas' } } } },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Listar tickets',
        description: '**Comportamiento por rol:**\n- `usuario` — solo ve sus propios tickets\n- `agente` / `admin` — ven todos los tickets',
        responses: {
          200: {
            description: 'Lista de tickets',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tickets: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/NoAutorizado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Crear nuevo ticket',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketRequest' } } },
        },
        responses: {
          201: { description: 'Ticket creado', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, ticket: { $ref: '#/components/schemas/Ticket' } } } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'El título es requerido' } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Obtener ticket por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ticket encontrado', content: { 'application/json': { schema: { type: 'object', properties: { ticket: { $ref: '#/components/schemas/Ticket' } } } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          404: { $ref: '#/components/responses/NoEncontrado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
      put: {
        tags: ['Tickets'],
        summary: 'Actualizar datos del ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TicketRequest' } } },
        },
        responses: {
          200: { description: 'Ticket actualizado', content: { 'application/json': { schema: { type: 'object', properties: { mensaje: { type: 'string' }, ticket: { $ref: '#/components/schemas/Ticket' } } } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'El título no puede estar vacío' } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { description: 'Sin permiso', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'No tienes permiso para editar este ticket' } } } },
          404: { $ref: '#/components/responses/NoEncontrado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
      delete: {
        tags: ['Tickets'],
        summary: 'Eliminar ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ticket eliminado' },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { description: 'Sin permiso', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'No tienes permiso para realizar esta acción' } } } },
          404: { $ref: '#/components/responses/NoEncontrado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/tickets/{id}/estado': {
      patch: {
        tags: ['Tickets'],
        summary: 'Actualizar estado del ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado'],
                properties: {
                  estado: { type: 'string', enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado' },
          400: { description: 'Estado inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'Estado inválido', estadosValidos: ['abierto', 'en_progreso', 'resuelto', 'cerrado'] } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { description: 'Sin permiso', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'No tienes permiso para realizar esta acción' } } } },
          404: { $ref: '#/components/responses/NoEncontrado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
    '/api/tickets/{id}/comentarios': {
      post: {
        tags: ['Tickets'],
        summary: 'Agregar comentario a un ticket',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['texto'],
                properties: { texto: { type: 'string', example: 'Estamos revisando el problema.' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Comentario agregado' },
          400: { description: 'Texto requerido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { mensaje: 'El texto del comentario es requerido' } } } },
          401: { $ref: '#/components/responses/NoAutorizado' },
          404: { $ref: '#/components/responses/NoEncontrado' },
          500: { $ref: '#/components/responses/ErrorServidor' },
        },
      },
    },
  },
};

const configurarSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(especificacion));
};

module.exports = { configurarSwagger };
