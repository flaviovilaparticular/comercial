import { Router, Request, Response } from 'express';
import { BancoModel } from './Bancos.schema';
import * as mongoose from 'mongoose';

const router = Router();

/**
 * 🔹 GET /bancos
 * Obtener todos los bancos activos
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const bancos = await BancoModel
            .find({ activo: true })
            .sort({ nombre: 1 });

        res.status(200).json(bancos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener bancos',
            error
        });
    }
});

/**
 * 🔹 GET /bancos/:id
 * Obtener banco por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const banco = await BancoModel.findById(id);

        if (!banco) {
            return res.status(404).json({ message: 'Banco no encontrado' });
        }

        res.status(200).json(banco);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener banco',
            error
        });
    }
});

/**
 * 🔹 POST /bancos
 * Crear banco
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                message: 'El nombre del banco es obligatorio'
            });
        }

        const existe = await BancoModel.findOne({ nombre });

        if (existe) {
            return res.status(400).json({
                message: 'El banco ya existe'
            });
        }

        const banco = new BancoModel({
            nombre
        });

        await banco.save();

        res.status(201).json(banco);
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear banco',
            error
        });
    }
});

/**
 * 🔹 PUT /bancos/:id
 * Actualizar banco
 */
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const banco = await BancoModel.findByIdAndUpdate(
            id,
            { nombre, activo },
            { new: true }
        );

        if (!banco) {
            return res.status(404).json({ message: 'Banco no encontrado' });
        }

        res.status(200).json(banco);
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar banco',
            error
        });
    }
});

/**
 * 🔹 DELETE /bancos/:id
 * Baja lógica del banco
 */
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const banco = await BancoModel.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!banco) {
            return res.status(404).json({ message: 'Banco no encontrado' });
        }

        res.status(200).json({
            message: 'Banco dado de baja correctamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar banco',
            error
        });
    }
});

export default router;
