import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Datos reales de gimnasios
const REAL_GYMS = [
    {
        name: 'BeastMode Fitness Center',
        address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
        users: [
            { name: 'Carlos Mendoza', email: 'carlos.admin@beastmode.com', phone: '+52 55 1234 5678', role: 'ADMIN' },
            { name: 'Ana García', email: 'ana.garcia@email.com', phone: '+52 55 2345 6789', role: 'USER' },
            { name: 'Luis Rodríguez', email: 'luis.rodriguez@email.com', phone: '+52 55 3456 7890', role: 'USER' },
            { name: 'María López', email: 'maria.lopez@email.com', phone: '+52 55 4567 8901', role: 'TRAINER' },
            { name: 'Pedro Sánchez', email: 'pedro.sanchez@email.com', phone: '+52 55 5678 9012', role: 'USER' }
        ],
        classes: [
            { name: 'CrossFit Matutino', description: 'Entrenamiento funcional de alta intensidad para comenzar el día con energía' },
            { name: 'Yoga Relajante', description: 'Sesión de yoga para relajar cuerpo y mente, ideal para todos los niveles' },
            { name: 'Spinning Nocturno', description: 'Clase de ciclismo indoor con música energética y ambiente motivador' },
            { name: 'Boxeo Funcional', description: 'Entrenamiento de boxeo combinado con ejercicios funcionales' }
        ]
    },
    {
        name: 'PowerLift Gym',
        address: 'Calle Revolución 567, Col. San Ángel, CDMX',
        users: [
            { name: 'Roberto Jiménez', email: 'roberto.admin@powerlift.com', phone: '+52 55 6789 0123', role: 'ADMIN' },
            { name: 'Sandra Torres', email: 'sandra.torres@email.com', phone: '+52 55 7890 1234', role: 'USER' },
            { name: 'Diego Morales', email: 'diego.morales@email.com', phone: '+52 55 8901 2345', role: 'USER' },
            { name: 'Carmen Ruiz', email: 'carmen.ruiz@email.com', phone: '+52 55 9012 3456', role: 'TRAINER' },
            { name: 'Alejandro Vega', email: 'alejandro.vega@email.com', phone: '+52 55 0123 4567', role: 'USER' }
        ],
        classes: [
            { name: 'Powerlifting Avanzado', description: 'Entrenamiento especializado en levantamiento de potencia para atletas experimentados' },
            { name: 'Stretching y Movilidad', description: 'Sesión de estiramiento y mejora de movilidad articular' },
            { name: 'HIIT Extremo', description: 'Entrenamiento de intervalos de alta intensidad para quema de grasa' },
            { name: 'Calistenia', description: 'Entrenamiento con peso corporal y movimientos funcionales' }
        ]
    },
    {
        name: 'FitZone Premium',
        address: 'Blvd. Miguel de Cervantes 890, Col. Polanco, CDMX',
        users: [
            { name: 'Gabriela Hernández', email: 'gabriela.admin@fitzone.com', phone: '+52 55 1357 2468', role: 'ADMIN' },
            { name: 'Fernando Castro', email: 'fernando.castro@email.com', phone: '+52 55 2468 1357', role: 'USER' },
            { name: 'Valeria Mendez', email: 'valeria.mendez@email.com', phone: '+52 55 3579 2468', role: 'USER' },
            { name: 'Ricardo Flores', email: 'ricardo.flores@email.com', phone: '+52 55 4680 1357', role: 'TRAINER' },
            { name: 'Sofía Vargas', email: 'sofia.vargas@email.com', phone: '+52 55 5791 2468', role: 'USER' }
        ],
        classes: [
            { name: 'Aqua Fitness', description: 'Ejercicios cardiovasculares y de resistencia en piscina climatizada' },
            { name: 'Pilates Reformer', description: 'Entrenamiento de pilates con equipos especializados' },
            { name: 'Zumba Fitness', description: 'Baile fitness con ritmos latinos y música energética' },
            { name: 'TRX Suspension', description: 'Entrenamiento en suspensión para fuerza y estabilidad' }
        ]
    }
];

// Planes de suscripción reales
const SUBSCRIPTION_PLANS = [
    { name: 'Plan Básico Mensual', duration: 30, price: 599.00 },
    { name: 'Plan Estándar Trimestral', duration: 90, price: 1599.00 },
    { name: 'Plan Premium Semestral', duration: 180, price: 2999.00 },
    { name: 'Plan VIP Anual', duration: 365, price: 4999.00 }
];

async function createGymWithUsersAndClasses() {
    for (const gymData of REAL_GYMS) {
        const gym = await prisma.gym.create({
            data: {
                name: gymData.name,
                address: gymData.address,
            },
        });

        console.log(`🏋️‍♂️ Gym creado: ${gym.name}`);

        // Crear usuarios reales para cada gym
        const users = [];
        for (const userData of gymData.users) {
            const password = await bcrypt.hash('BeastMode2024!', 10);
            
            const user = await prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    password,
                    phone: userData.phone,
                    role: userData.role as any,
                    gymId: gym.id,
                },
            });

            // Solo los USER y TRAINER tienen suscripción
            if (user.role === 'USER' || user.role === 'TRAINER') {
                const selectedPlan = SUBSCRIPTION_PLANS[Math.floor(Math.random() * SUBSCRIPTION_PLANS.length)];
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Empezó hace 0-30 días
                const endDate = new Date(startDate.getTime() + selectedPlan.duration * 24 * 60 * 60 * 1000);                
                await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        planName: selectedPlan.name,
                        price: selectedPlan.price,
                        isActive: true,
                        startDate,
                        endDate,
                    },
                });

                console.log(`💳 Suscripción ${selectedPlan.name} creada para ${user.name}`);
            }

            users.push(user);
        }

        // Crear clases reales para cada gym
        for (const classData of gymData.classes) {
            // Crear clases para la próxima semana
            const daysOfWeek = [1, 2, 3, 4, 5]; // Lunes a Viernes
            
            for (const day of daysOfWeek) {
                const startTime = new Date();
                startTime.setDate(startTime.getDate() + day);
                
                // Horarios realistas según el tipo de clase
                if (classData.name.includes('Matutino') || classData.name.includes('CrossFit')) {
                    startTime.setHours(7, 0, 0, 0); // 7:00 AM
                } else if (classData.name.includes('Yoga') || classData.name.includes('Pilates')) {
                    startTime.setHours(10, 30, 0, 0); // 10:30 AM
                } else if (classData.name.includes('Nocturno') || classData.name.includes('Spinning')) {
                    startTime.setHours(19, 30, 0, 0); // 7:30 PM
                } else {
                    startTime.setHours(18, 0, 0, 0); // 6:00 PM
                }
                
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora de duración

                const fitnessClass = await prisma.class.create({
                    data: {
                        name: classData.name,
                        description: classData.description,
                        startTime,
                        endTime,
                        maxUsers: 15, // Capacidad realista
                        gymId: gym.id,
                        enrollments: {
                            create: users
                                .filter(u => u.role === 'USER') // Solo usuarios normales se inscriben
                                .slice(0, Math.floor(Math.random() * 3) + 1) // 1-3 usuarios inscritos
                                .map((u) => ({
                                    userId: u.id,
                                })),
                        },
                    },
                });

                console.log(`📅 Clase creada: ${fitnessClass.name} - ${startTime.toLocaleDateString('es-MX')} ${startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`);
            }
        }
    }
}

async function main() {
    console.log('🧼 Limpiando base de datos...');
    
    await prisma.gymAccess.deleteMany();
    await prisma.classEnrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gym.deleteMany();

    console.log('✅ Base de datos limpiada');
    console.log('🏗️ Creando datos reales...');

    await createGymWithUsersAndClasses();

    console.log('');
    console.log('🎉 ¡Seed completado exitosamente!');
    console.log('');
    console.log('📊 Resumen de datos creados:');
    console.log('• 3 Gimnasios con ubicaciones reales en CDMX');
    console.log('• 15 Usuarios (5 por gym: 1 admin, 1 trainer, 3 usuarios)');
    console.log('• Suscripciones activas para usuarios y trainers');
    console.log('• Clases programadas para la próxima semana');
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log('Email: carlos.admin@beastmode.com (ADMIN)');
    console.log('Email: roberto.admin@powerlift.com (ADMIN)');
    console.log('Email: gabriela.admin@fitzone.com (ADMIN)');
    console.log('Password: BeastMode2024!');
    console.log('');
}

main()
    .catch((e) => {
        console.error('🔥 Error en el seed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
