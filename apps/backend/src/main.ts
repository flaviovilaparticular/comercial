import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';
import 'dotenv/config';
import testRoute from '././router/router.test';
import testMongoRoute from './router/testMongo.route'

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Conectar a Mongo
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/test-mongo', testMongoRoute);
// 🔹 Usar rutas
app.use('/api/test', testRoute);

// Levantar servidor
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
