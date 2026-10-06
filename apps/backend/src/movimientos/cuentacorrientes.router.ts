import { Router, Request, Response } from 'express';
import { CuentaCorrienteModel } from './cuentacorrientes.schema'; // Ajustá el nombre del schema según tu archivo
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';

const router = Router();

/**
 * GET /cuentas-corrientes
 * Obtener todos los registros de cuenta corriente (admite filtros por query params)
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idEntidad, estado, tipoEntidad, tipoOperacion } = req.query;

        const filtro: any = {};

        if (idEntidad) {
            if (!mongoose.Types.ObjectId.isValid(idEntidad as string)) {
                return res.status(400).json({
                    ok: false,
                    message: 'ID de entidad inválido'
                });
            }
            filtro.idEntidad = idEntidad;
        }

        if (estado) filtro.estado = estado;
        if (tipoEntidad) filtro.tipoEntidad = tipoEntidad;
        if (tipoOperacion) filtro.tipoOperacion = tipoOperacion;

        const cuentas = await CuentaCorrienteModel.find(filtro).sort({ fechaEmision: -1 });
        res.json(cuentas);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo registros de cuenta corriente',
            error
        });
    }
});

/**
 * GET /cuentas-corrientes/saldo/:idEntidad
 * Obtener el saldo total adeudado y cantidad de facturas pendientes de una entidad
 */
router.get('/saldo/:idEntidad', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idEntidad } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idEntidad)) {
            return res.status(400).json({
                ok: false,
                message: 'ID de entidad inválido'
            });
        }

        const resultado = await CuentaCorrienteModel.aggregate([
            {
                $match: {
                    idEntidad: new mongoose.Types.ObjectId(idEntidad),
                    estado: 'PENDIENTE'
                }
            },
            {
                $group: {
                    _id: '$idEntidad',
                    totalAdeudado: { $sum: '$montoTotal' },
                    cantidadPendientes: { $sum: 1 }
                }
            }
        ]);

        const saldoInfo = resultado.length > 0
            ? resultado[0]
            : { totalAdeudado: 0, cantidadPendientes: 0 };

        res.json({
            ok: true,
            data: saldoInfo
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error calculando saldo de la entidad',
            error
        });
    }
});

/**
 * 🔹 GET /cuentas-corrientes/:id
 * Obtener registro de cuenta corriente por ID
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const cuenta = await CuentaCorrienteModel.findById(id);

        if (!cuenta) {
            return res.status(404).json({
                ok: false,
                message: 'Registro de cuenta corriente no encontrado'
            });
        }

        res.json(cuenta);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo registro de cuenta corriente',
            error
        });
    }
});

/**
 * 🔹 POST /cuentas-corrientes
 * Crear nuevo registro de cuenta corriente (al generar factura a C/C)
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
    console.log("BODY RECIBIDO C/C:", req.body);

    const { montoTotal, idEntidad, idMovimiento } = req.body;

    // Validaciones iniciales
    if (montoTotal === undefined || montoTotal === null || montoTotal <= 0) {
        return res.status(400).json({
            ok: false,
            message: "El monto total debe ser mayor a 0."
        });
    }

    if (!idEntidad || !mongoose.Types.ObjectId.isValid(idEntidad)) {
        return res.status(400).json({
            ok: false,
            message: 'ID de entidad inválido o no proporcionado'
        });
    }

    if (!idMovimiento || !mongoose.Types.ObjectId.isValid(idMovimiento)) {
        return res.status(400).json({
            ok: false,
            message: 'ID de movimiento inválido o no proporcionado'
        });
    }

    try {
        const nuevaCuenta = new CuentaCorrienteModel(req.body);
        const cuentaGuardada = await nuevaCuenta.save();

        res.status(201).json(cuentaGuardada);
    } catch (error) {
        console.error("ERROR GUARDANDO CUENTA CORRIENTE:", error);
        res.status(400).json({
            ok: false,
            message: 'Error registrando cuenta corriente',
            error
        });
    }
});

/**
 * 🔹 PUT /cuentas-corrientes/:id/cancelar
 * Cancelar/Pagar registro de cuenta corriente (llena datosPago y cambia estado)
 */
router.put('/:id/cancelar', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const { tipoComprobante, nroComprobante, monto, formaDePago, fechaPago, idMovimientoPago } = req.body;

        const cuentaActualizada = await CuentaCorrienteModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    estado: 'CANCELADA',
                    datosPago: {
                        tipoComprobante: tipoComprobante || 'RECIBO',
                        nroComprobante: nroComprobante || '',
                        monto: monto || 0,
                        formaDePago: formaDePago || 'EFECTIVO',
                        fechaPago: fechaPago || new Date(),
                        idMovimientoPago: idMovimientoPago || null
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!cuentaActualizada) {
            return res.status(404).json({
                ok: false,
                message: 'Registro de cuenta corriente no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Cuenta corriente cancelada correctamente',
            data: cuentaActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error cancelando cuenta corriente',
            error
        });
    }
});

/**
 * 🔹 PUT /cuentas-corrientes/:id
 * Actualización general de registro
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const cuentaActualizada = await CuentaCorrienteModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!cuentaActualizada) {
            return res.status(404).json({
                ok: false,
                message: 'Registro de cuenta corriente no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Registro de cuenta corriente actualizado',
            data: cuentaActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error actualizando cuenta corriente',
            error
        });
    }
});

/**
 * 🔹 DELETE /cuentas-corrientes/:id
 * Eliminar registro de cuenta corriente
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const cuentaEliminada = await CuentaCorrienteModel.findByIdAndDelete(id);

        if (!cuentaEliminada) {
            return res.status(404).json({
                ok: false,
                message: 'Registro de cuenta corriente no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Registro de cuenta corriente eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error eliminando registro de cuenta corriente',
            error
        });
    }
});

export const CuentaCorrienteRouter = router;