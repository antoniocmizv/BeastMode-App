const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'BeastMode API',
      version: '1.0.0',
      description: 'Documentación manual de los endpoints REST',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
      },
    ],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Registrar un nuevo usuario',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                  required: ['name', 'email', 'password'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Usuario registrado y token devuelto' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login de usuario',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Usuario autenticado y token devuelto' },
          },
        },
      },
      '/profile': {
        get: {
          summary: 'Ruta protegida para probar el token',
          tags: ['Test'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Devuelve el usuario autenticado' },
            '401': { description: 'No autenticado' },
          },
        },
      },
      '/users': {
        get: {
          summary: 'Obtener todos los usuarios',
          tags: ['Users'],
          responses: {
            '200': {
              description: 'Lista de usuarios',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Crear usuario',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['USER', 'ADMIN', 'TRAINER'] },
                    gymId: { type: 'string' },
                  },
                  required: ['name', 'email', 'password'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Usuario creado' },
          },
        },
      },
      '/users/{id}': {
        get: {
          summary: 'Obtener un usuario por ID',
          tags: ['Users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Datos del usuario',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '404': { description: 'Usuario no encontrado' },
          },
        },
      },
      '/gyms': {
        get: {
          summary: 'Obtener todos los gimnasios',
          tags: ['Gyms'],
          responses: {
            '200': {
              description: 'Lista de gimnasios',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Gym' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Crear un gimnasio (solo ADMIN)',
          tags: ['Gyms'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                  required: ['name', 'address'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Gimnasio creado' },
            '403': { description: 'No autorizado' },
          },
        },
      },
      '/classes': {
        get: {
          summary: 'Obtener todas las clases',
          tags: ['Classes'],
          responses: {
            '200': {
              description: 'Lista de clases',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Class' },
                  },
                },
              },
            },
          },
        },
      },
      '/subscriptions': {
        get: {
          summary: 'Obtener todas las suscripciones',
          tags: ['Subscriptions'],
          responses: {
            '200': { description: 'Lista de suscripciones' },
          },
        },
        post: {
          summary: 'Crear una suscripción',
          tags: ['Subscriptions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string' },
                    planName: { type: 'string' },
                    price: { type: 'number' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                  },
                  required: ['userId', 'planName', 'price', 'startDate', 'endDate'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Suscripción creada' },
          },
        },
      },
      '/subscriptions/user/{userId}': {
        get: {
          summary: 'Obtener suscripciones de un usuario',
          tags: ['Subscriptions'],
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Lista de suscripciones',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Subscription' },
                  },
                },
              },
            },
          },
        },      },
      '/qr/generate': {
        post: {
          summary: 'Generar QR para acceso al gimnasio',
          tags: ['QR Access'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    gymId: { type: 'string' },
                  },
                  required: ['gymId'],
                },
              },
            },
          },
          responses: {
            '200': { 
              description: 'QR generado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      qrToken: { type: 'string' },
                      expiresAt: { type: 'string', format: 'date-time' },
                      gymAccess: { $ref: '#/components/schemas/GymAccess' },
                    },
                  },
                },
              },
            },
            '403': { description: 'Sin suscripción activa o acceso al gimnasio' },
          },
        },
      },
      '/qr/validate': {
        post: {
          summary: 'Validar QR en la entrada (ADMIN/TRAINER)',
          tags: ['QR Access'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    qrToken: { type: 'string' },
                  },
                  required: ['qrToken'],
                },
              },
            },
          },
          responses: {
            '200': { 
              description: 'Acceso autorizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      gym: { $ref: '#/components/schemas/Gym' },
                      accessTime: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            '400': { description: 'QR inválido, usado o expirado' },
            '404': { description: 'QR no encontrado' },
          },
        },
      },
      '/qr/history': {
        get: {
          summary: 'Obtener historial de accesos del usuario',
          tags: ['QR Access'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { 
              description: 'Historial de accesos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/GymAccess' },
                  },
                },
              },
            },
          },
        },
      },
      '/qr/stats/{gymId}': {
        get: {
          summary: 'Obtener estadísticas de acceso del gimnasio (ADMIN/TRAINER)',
          tags: ['QR Access'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'gymId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID del gimnasio',
            },
          ],
          responses: {
            '200': { 
              description: 'Estadísticas de acceso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      todayAccesses: { type: 'integer' },
                      uniqueUsersToday: { type: 'integer' },
                      totalHistoricalAccesses: { type: 'integer' },
                      todayAccessDetails: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/GymAccess' },
                      },
                    },
                  },
                },
              },
            },
            '403': { description: 'Sin permisos para ver estadísticas' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'TRAINER'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Gym: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            maxUsers: { type: 'integer' },
            gymId: { type: 'string' },
          },
        },        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            planName: { type: 'string' },
            price: { type: 'number' },
            isActive: { type: 'boolean' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
        GymAccess: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            gymId: { type: 'string' },
            qrToken: { type: 'string' },
            isUsed: { type: 'boolean' },
            expiresAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            usedAt: { type: 'string', format: 'date-time', nullable: true },
            user: { $ref: '#/components/schemas/User' },
            gym: { $ref: '#/components/schemas/Gym' },
          },
        },
      },
    },
  };
  
  export default swaggerDocument;
  