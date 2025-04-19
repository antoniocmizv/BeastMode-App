import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import userRoutes from './routes/user.routes';
import gymRoutes from './routes/gym.routes';
import classRoutes from './routes/class.routes';
import subscriptionRoutes from './routes/subscription.routes';
import chatRoutes from './routes/chat.routes';
import messageRoutes from './routes/message.routes';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger';

import { errorHandler } from './middlewares/errorHandler';
import prisma from '../lib/prisma'; 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (_req, res) => {
  res.send('🏋️ BeastMode API funcionando');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Middleware global de errores
app.use(errorHandler);

// ----------------------------------------
// WebSocket con Socket.IO
// ----------------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Restringir al frontend en producción
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  socket.on('join-chat', (chatId: string) => {
    socket.join(chatId);
    console.log(`🟢 Usuario ${socket.id} se unió a chat ${chatId}`);
  });

  socket.on('send-message', async ({ chatId, senderId, content }) => {
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
      },
    });

    io.to(chatId).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Usuario desconectado: ${socket.id}`);
  });
});

// Iniciar servidor con Express + WebSocket
server.listen(3000, () => {
  console.log('🔥 Servidor y WebSocket corriendo en http://localhost:3000');
});
