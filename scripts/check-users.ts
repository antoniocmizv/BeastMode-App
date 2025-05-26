import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                gymId: true
            }
        });
        
        console.log('📋 Usuarios en la base de datos:');
        console.table(users);
        
        const gyms = await prisma.gym.findMany({
            select: {
                id: true,
                name: true,
                address: true
            }
        });
        
        console.log('\n🏋️‍♂️ Gimnasios en la base de datos:');
        console.table(gyms);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
