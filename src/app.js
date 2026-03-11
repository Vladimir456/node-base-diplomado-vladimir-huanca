import express from 'express';
import morgan from 'morgan';
import usersRoutes from './routes/users.route.js';
import authRoutes from './routes/auth.route.js';
import tasksRoutes from './routes/tasks.route.js';

const app = express();

app.use(express.json());
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('API diplomado funcionando');
});

app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tasks', tasksRoutes);

export default app;