import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';
import 'dotenv/config';

// Importar rutas
import testRoute from './router/router.test';
import testMongoRoute from './router/testMongo.route';
import AuthRouter from './auth/auth.routes';
import { UsersRouter } from './users/user.controller';

// --------------------------------------------------

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// 🔹 Conectar a Mongo
connectDB();

// 🔹 Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔹 Registrar rutas
app.use('/api/test', testRoute);
app.use('/api/test-mongo', testMongoRoute);
app.use('/api/users', UsersRouter);
app.use('/api/auth', AuthRouter);

// 🔹 Ruta base (opcional)
app.get('/', (req, res) => {
  res.send({ message: 'API funcionando ✅' });
});

// 🔹 Levantar servidor
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
