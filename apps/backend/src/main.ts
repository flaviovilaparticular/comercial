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

// PARAMETROS
import CentroCostosRouter from './parametros/CentroCostos/CentroCostos.router';
import ProvinciasRouter from './parametros/Provincias/Provinicias.router';
import IndicesRouter from './parametros/Indices/indices.router';
import BancosRouter from './parametros/Bancos/Bancos.router';
import { LocalidadesRouter } from './parametros/Localidades/Localidades.router';
//import{FormadePagoRouter} from './parametros/FormadePago/FormadePago.router';
import FormadePagoRouter from './parametros/FormadePago/FormadePago.router';



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

// Parametros
app.use('/api/parametros/centro-costos', CentroCostosRouter);
app.use('/api/parametros/Provincias', ProvinciasRouter);
app.use('/api/parametros/Paises', ProvinciasRouter);
app.use('/api/parametros/indices', IndicesRouter);
app.use('/api/parametros/bancos', BancosRouter);
app.use('/api/parametros/localidades', LocalidadesRouter);
app.use('/api/comunes/formas-de-pago', FormadePagoRouter);




// 🔹 Levantar servidor
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});