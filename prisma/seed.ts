import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const NUM_GYMS = 3;
const USERS_PER_GYM = 5;
const CLASSES_PER_GYM = 3;

async function createGymWithUsersAndClasses() {
    for (let i = 0; i < NUM_GYMS; i++) {
        const gym = await prisma.gym.create({
            data: {
                name: `${faker.company.name()} Gym`,
                address: faker.location.streetAddress(),
            },
        });

        console.log(`🏋️‍♂️ Gym creado: ${gym.name}`);

        // Usuarios
        const users = [];
        for (let j = 0; j < USERS_PER_GYM; j++) {
            const password = await bcrypt.hash('password123', 10);            const user = await prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    password,
                    phone: faker.phone.number(),
                    role: j === 0 ? 'ADMIN' : 'USER',
                    gymId: gym.id,
                },
            });

            // Solo los USER tienen suscripción
            if (user.role === 'USER') {
                const planTypes = [
                    { name: 'Mensual', duration: 30, price: 29.99 },
                    { name: 'Trimestral', duration: 90, price: 79.99 },
                    { name: 'Anual', duration: 365, price: 249.99 },
                ];                const selectedPlan = faker.helpers.arrayElement(planTypes);
                const startDate = faker.date.recent({ days: 10 });
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

        // Clases
        for (let k = 0; k < CLASSES_PER_GYM; k++) {
            const startTime = faker.date.soon();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            const fitnessClass = await prisma.class.create({
                data: {
                    name: faker.lorem.words(3),
                    description: faker.lorem.sentence(),
                    startTime,
                    endTime,
                    maxUsers: faker.number.int({ min: 5, max: 20 }),
                    gymId: gym.id,
                    enrollments: {
                        create: users.slice(0, faker.number.int({ min: 1, max: users.length })).map((u) => ({
                            userId: u.id,
                        })),
                    },
                },
            });

            console.log(`📅 Clase creada: ${fitnessClass.name}`);
        }
    }
}

async function main() {
    await prisma.gymAccess.deleteMany();
    await prisma.classEnrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gym.deleteMany();

    console.log('🧼 Base de datos limpiada');

    await createGymWithUsersAndClasses();

    console.log('✅ Seed finalizado');
}

main()
    .catch((e) => {
        console.error('🔥 Error en el seed', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
