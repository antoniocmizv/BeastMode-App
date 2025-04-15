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
        '/subscriptions': {
            get: {
                summary: 'Obtener todas las suscripciones',
                tags: ['Susbscriptions'],
                responses: {
                    '200': {
                        description: 'Lista de suscripciones',
                    },
                },
            },
            post: {
                summary: 'Crear una suscripción',
                tags: ['Susbscriptions'],
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
                    '201': {
                        description: 'Suscripción creada',
                    },
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
    },
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Gym: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    location: { type: 'string' },
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
            },
        },
    },
};

export default swaggerDocument;
