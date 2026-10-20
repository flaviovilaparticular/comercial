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
import { MarcasRouter } from './parametros/Marcas/marcas.router';
import { RubrosRouter } from './parametros/Rubros/rubros.router';
import FormadePagoRouter from './parametros/FormadePago/FormadePago.router';
import tipoPersonaRouter from './parametros/tipoPersona/tipoPersona.router';
import tipoDocumentoRouter from './parametros/tipoDocumento/tipoDocumento.router';
import EntidadRouter from './parametros/Entidades/Entidades.router';

// productos
import { ProductosRouter } from './Productos/productos.router';

// movimientos
import movimientosRouter from './movimientos/movimientos.router';
import { CuentaCorrienteRouter } from './movimientos/cuentacorrientes.router';

// --------------------------------------------------

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 10000;

async function bootstrap() {
  try {
    // 1. Esperar a conectar a MongoDB Atlas ANTES de iniciar Express
    await connectDB();

    const app = express();

    // 2. Middlewares
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // 3. Ruta base de salud
    app.get('/', (req, res) => {
      res.send({ message: 'API funcionando ' });
    });

    // 4. Registrar rutas
    app.use('/api/test', testRoute);
    app.use('/api/test-mongo', testMongoRoute);
    app.use('/api/users', UsersRouter);
    app.use('/api/auth', AuthRouter);

    // Parametros
    app.use('/api/parametros/centro-costos', CentroCostosRouter);
    app.use('/api/parametros/Provincias', ProvinciasRouter);
    app.use('/api/parametros/Paises', ProvinciasRouter);
    app.use('/api/parametros/indices', IndicesRouter);
    app.use('/api/parametros/bancos', BancosRouter);
    app.use('/api/parametros/localidades', LocalidadesRouter);
    app.use('/api/comunes/formas-de-pago', FormadePagoRouter);
    app.use('/api/parametros/tipo-persona', tipoPersonaRouter);
    app.use('/api/parametros/tipo-documento', tipoDocumentoRouter);
    app.use('/api/parametros/entidades', EntidadRouter);
    app.use('/api/parametros/marcas', MarcasRouter);
    app.use('/api/parametros/rubros', RubrosRouter);

    // productos
    app.use('/api/productos', ProductosRouter);

    // movimientos 
    app.use('/api/movimientos', movimientosRouter);
    app.use('/api/cuentacorriente', CuentaCorrienteRouter);

    // 5. Levantar servidor en 0.0.0.0
    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();