import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt'; // ajusta la ruta si es necesaria
import { JwtPayload } from './middlewares/auth.middleware'; 

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import userRoutes from './routes/user.routes';
import gymRoutes from './routes/gym.routes';
import classRoutes from './routes/class.routes';
import subscriptionRoutes from './routes/subscription.routes';
import chatRoutes from './routes/chat.routes';
import messageRoutes from './routes/message.routes';
import aiRoutes from './routes/ai.routes';
import qrRoutes from './routes/qr.routes';
import messageReadRoutes from './routes/messageRead.routes';



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
app.use('/api/ia', aiRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/message-reads', messageReadRoutes);

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

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) return next(new Error('Auth token missing'));
  try {
    const payload = verifyToken<JwtPayload>(token);
    socket.data.userId = payload.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  // 2. Unir a la sala con string puro
  socket.on('join-chat', (chatId: string) => {
    socket.join(chatId);
    console.log(`🟢 Usuario ${socket.id} se unió a chat ${chatId}`);
  });

  // 3. Usar socket.data.userId como senderId
  socket.on('send-message', async ({ chatId, content }: { chatId: string; content: string }) => {
    try {
      const senderId = socket.data.userId as string;
      // Crear el mensaje
      const message = await prisma.message.create({
        data: { chatId, senderId, content },
        include: { sender: { select: { id: true, name: true } } },
      });
      // Obtener usuarios del chat
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { users: { select: { id: true } } },
      });
      if (!chat) return;
      // Crear registros MessageRead (leído para emisor, no leído para receptores)
      await prisma.$transaction(
        (chat.users as { id: string }[]).map((u) =>
          prisma.messageRead.create({
            data: {
              messageId: message.id,
              userId: u.id,
              readAt: u.id === senderId ? new Date() : null,
            },
          })
        )
      );
      // Emitir solo a los receptores
      chat.users.forEach((u: { id: string }) => {
        if (u.id !== senderId) {
          socket.to(u.id).emit('receive-message', message);
        }
      });
      // Opcional: emitir al emisor también si lo deseas
      socket.emit('receive-message', message);
    } catch (err) {
      console.error('[ERROR]', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Usuario desconectado: ${socket.id}`);
  });
});

// Iniciar servidor con Express + WebSocket
server.listen(3000, () => {
  console.log('🔥 Servidor y WebSocket corriendo en http://localhost:3000');
});
