import { Router, Request, Response } from 'express';
import { EntidadModel } from './Entiidades.schema'; // ajustá la ruta si cambia
import * as mongoose from 'mongoose';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();

/**
 * 1️⃣ GET /
 * Obtener TODAS las entidades
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const entidades = await EntidadModel.find().sort({ nombreRazonSocial: 1 });
        return res.json(entidades);
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Error obteniendo entidades',
            error
        });
    }
});

/**
 * 2️⃣ GET /proveedores
 * Trae solo las entidades que tienen al menos un movimiento con tipoEntidad: "Proveedor"
 * (VA ANTES DE /:id PARA QUE EXPRESS NO CONFUNDA "proveedores" CON UN ID)
 */


router.get('/proveedores', verifyToken, async (req: Request, res: Response) => {
    try {
        const proveedores = await EntidadModel.aggregate([
            {
                $lookup: {
                    from: 'movimientos', // Nombre de la colección en Mongo
                    let: { entidadId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        // 👈 Aquí está la corrección clave: $datosEntidad.idEntidad
                                        { $eq: [{ $toString: '$datosEntidad.idEntidad' }, { $toString: '$$entidadId' }] },
                                        { $eq: ['$tipoEntidad', 'Proveedor'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'movimientosProveedor'
                }
            },
            {
                // Solo conserva las entidades que tengan AL MENOS 1 movimiento de tipo "Proveedor"
                $match: {
                    'movimientosProveedor.0': { $exists: true }
                }
            },
            {
                // Limpiamos el array temporal de movimientos
                $project: {
                    movimientosProveedor: 0
                }
            },
            {
                $sort: { nombreRazonSocial: 1 }
            }
        ]);

        return res.json(proveedores);

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener proveedores',
            error: String(error)
        });
    }
});

/**
 * 3️⃣ GET /:id
 * Obtener entidad por ID (SIEMPRE AL FINAL DE LOS GET)
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

        const entidad = await EntidadModel.findById(id);

        if (!entidad) {
            return res.status(404).json({
                ok: false,
                message: 'Entidad no encontrada'
            });
        }

        return res.json(entidad);
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Error obteniendo entidad',
            error
        });
    }
});
/**
 * 🔹 POST /entidades
 * Crear entidad
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const nuevaEntidad = new EntidadModel(req.body);
        const entidadGuardada = await nuevaEntidad.save();

        res.status(201).json({
            ok: true,
            message: 'Entidad creada',
            data: entidadGuardada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error creando entidad',
            error
        });
    }
});

/**
 * 🔹 PUT /entidades/:id
 * Actualizar entidad
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

        const entidadActualizada = await EntidadModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!entidadActualizada) {
            return res.status(404).json({
                ok: false,
                message: 'Entidad no encontrada'
            });
        }

        res.json({
            ok: true,
            message: 'Entidad actualizada',
            data: entidadActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error actualizando entidad',
            error
        });
    }
});

export default router;