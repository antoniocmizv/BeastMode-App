import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import userRoutes from './routes/user.routes';
import gymRoutes from './routes/gym.routes';
import classRoutes from './routes/class.routes';
import subscriptionRoutes from './routes/subscription.routes';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (_req, res) => {
  res.send('🏋️ BeastMode API funcionando');
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(3000, () => {
  console.log('🔥 Servidor corriendo en http://localhost:3000');
});


