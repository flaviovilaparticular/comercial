import { Router, Request, Response } from 'express';
import { EntidadModel } from './Entiidades.schema'; // ajustá la ruta si cambia
import * as mongoose from 'mongoose';
import { verifyToken } from '../../auth/auth.middleware';
import { successResponse, errorResponse } from '../../Utilidades/apiResponse';

const router = Router();

/**
 * 🔹 GET /entidades
 * Obtener todas las entidades
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const entidades = await EntidadModel.find().sort({ nombreRazonSocial: 1 });
        res.json(entidades);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo entidades',
            error
        });
    }
});

/**
 * 🔹 GET /entidades/:id
 * Obtener entidad por ID
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

        res.json(entidad);
    } catch (error) {
        res.status(500).json({
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
