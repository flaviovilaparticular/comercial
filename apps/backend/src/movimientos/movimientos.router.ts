import { Router, Request, Response } from 'express';
import MovimientoModel from './movimientos.schema'; // Ajustá la ruta según tu proyecto
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '../Utilidades/apiResponse';
import { CuentaCorrienteModel } from './cuentacorrientes.schema';
import { ProductoModel } from '../Productos/productos.schema';

const router = Router();

/**
 *  GET /movimientos
 * Obtener movimientos con filtros opcionales:
 * - tipoEntidad: 'Proveedor' | 'Cliente'
 * - entidadId: ID específico de la entidad (MongoDB ObjectId)
 * - formaDePago: ID específico de la forma de pago
 * - fechaDesde, fechaHasta: rango de fechas (ej: YYYY-MM-DD)
 */
/**
 * GET /movimientos
 * Obtener movimientos con filtros opcionales
 * 
 */

ProductoModel.modelName;

router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { tipoEntidad, entidadId, formaDePago, fechaDesde, fechaHasta } = req.query;
        const queryFilter: any = {};

        // 1. Filtro tipo de entidad ('Proveedor' / 'Cliente')
        if (tipoEntidad) {
            queryFilter.tipoEntidad = tipoEntidad;
        }

        // 2. Filtro por entidad
        if (entidadId && mongoose.Types.ObjectId.isValid(entidadId as string)) {
            queryFilter['datosEntidad.idEntidad'] = entidadId;
        }

        // 3. Filtro forma de pago
        if (formaDePago) {
            queryFilter.formaDePago = formaDePago;
        }

        // 4. Filtro por rango de fecha
        if (fechaDesde || fechaHasta) {
            queryFilter.fechaAlta = {};

            if (fechaDesde) {
                const desde = new Date(fechaDesde as string);
                desde.setUTCHours(0, 0, 0, 0);
                queryFilter.fechaAlta.$gte = desde;
            }

            if (fechaHasta) {
                const hasta = new Date(fechaHasta as string);
                hasta.setUTCHours(23, 59, 59, 999);
                queryFilter.fechaAlta.$lte = hasta;
            }
        }

        //  Eliminamos cualquier .populate()
        // Traemos los documentos directo de la colección
        const movimientos = await MovimientoModel.find(queryFilter)
            .sort({ fechaAlta: -1 })
            .lean(); // .lean() mejora la velocidad al retornar JSON plano

        return res.json({
            ok: true,
            total: movimientos.length,
            movimientos
        });

    } catch (error: any) {
        console.error('❌ ERROR REAL EN EL BACKEND:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error obteniendo movimientos',
            error: error.message || error
        });
    }
});
/**
 * 🔹 GET /movimientos/:id
 * Obtener detalle de un movimiento específico
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ ok: false, message: 'ID inválido' });
        }

        const movimiento = await MovimientoModel.findById(id)
            .populate('entidad')
            .populate('formaDePago')
            .populate('items.producto');

        if (!movimiento) {
            return res.status(404).json({ ok: false, message: 'Movimiento no encontrado' });
        }

        res.json(movimiento);
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error obteniendo detalle', error });
    }
});

/**
 * 🔹 POST /movimientos
 * Registrar una Compra o Venta

router.post('/', verifyToken, async (req: Request, res: Response) => {

    try {
        const nuevoMovimiento = new MovimientoModel(req.body);

        // Guardamos directamente
        const movimientoGuardado = await nuevoMovimiento.save();

        res.status(201).json({
            ok: true,
            message: 'Movimiento registrado con éxito (sin transacción)',
            data: movimientoGuardado
        });

    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error registrando movimiento',
            error
        });
    }
});
 */

router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        // 1. Guardar el movimiento principal
        const nuevoMovimiento = new MovimientoModel(req.body);
        const movimientoGuardado = await nuevoMovimiento.save();

        // 2. Si es cuenta corriente, impactar en la colección de cuentas corrientes
        if (movimientoGuardado.esCuentaCorriente) {
            const nuevaCuentaCorriente = new CuentaCorrienteModel({
                idMovimiento: movimientoGuardado._id,
                tipoOperacion: movimientoGuardado.tipoOperacion, // 'COMPRA' | 'VENTA'
                tipoEntidad: movimientoGuardado.tipoEntidad,     // 'Cliente' | 'Proveedor'
                idEntidad: movimientoGuardado.datosEntidad.idEntidad,
                datosEntidad: {
                    nombreRazonSocial: movimientoGuardado.datosEntidad.nombreRazonSocial,
                    tipoDocumento: movimientoGuardado.datosEntidad.tipoDocumento,
                    documentoNumero: movimientoGuardado.datosEntidad.documentoNumero,
                    condicionIVA: movimientoGuardado.datosEntidad.condicionIVA
                },
                tipoComprobante: movimientoGuardado.tipoComprobante,
                nroComprobante: movimientoGuardado.nroComprobante,
                montoTotal: movimientoGuardado.totalFinal,      // 👈 Aquí mapeamos totalFinal a montoTotal
                fechaEmision: movimientoGuardado.fechaAlta || new Date(),
                estado: 'PENDIENTE',
                observaciones: movimientoGuardado.observaciones
            });

            await nuevaCuentaCorriente.save();
        }

        return res.status(201).json({
            ok: true,
            message: 'Movimiento y Cuenta Corriente registrados con éxito',
            data: movimientoGuardado
        });

    } catch (error: any) {
        console.error('❌ ERROR AL REGISTRAR MOVIMIENTO:', error);

        return res.status(400).json({
            ok: false,
            message: 'Error registrando el movimiento',
            error: error.errors || error.message || error
        });
    }
});
/**
 * 🔹 GET /movimientos/entidad/:entidadId
 * Obtener historial de movimientos de un cliente o proveedor específico
 */
router.get('/entidad/:entidadId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { entidadId } = req.params;
        const movimientos = await MovimientoModel.find({ entidad: entidadId })
            .sort({ fechaAlta: -1 });

        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error obteniendo historial', error });
    }
});

export default router;