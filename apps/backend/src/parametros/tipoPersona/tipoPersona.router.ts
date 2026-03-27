import { Router, Request, Response } from 'express';
import { TipoPersonaModel } from './tipoPersona.schema'; // Ajusta la ruta según tu estructura
import * as mongoose from 'mongoose';

const router = Router();

/**
 * 🔹 GET /tipos-persona
 * Obtener todos los tipos de persona activos
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const tipos = await TipoPersonaModel
            .find({ activo: true })
            .sort({ nombre: 1 });

        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener tipos de persona',
            error
        });
    }
});

/**
 * 🔹 GET /tipos-persona/:id
 * Obtener tipo de persona por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const tipo = await TipoPersonaModel.findById(id);

        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de persona no encontrado' });
        }

        res.status(200).json(tipo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener tipo de persona',
            error
        });
    }
});

/**
 * 🔹 POST /tipos-persona
 * Crear tipo de persona
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                message: 'El nombre del tipo de persona es obligatorio'
            });
        }

        const existe = await TipoPersonaModel.findOne({ nombre });

        if (existe) {
            return res.status(400).json({
                message: 'El tipo de persona ya existe'
            });
        }

        const tipo = new TipoPersonaModel({
            nombre,
            descripcion
        });

        await tipo.save();

        res.status(201).json(tipo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear tipo de persona',
            error
        });
    }
});

/**
 * 🔹 PUT /tipos-persona/:id
 * Actualizar tipo de persona
 */
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const tipo = await TipoPersonaModel.findByIdAndUpdate(
            id,
            { nombre, descripcion, activo },
            { new: true }
        );

        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de persona no encontrado' });
        }

        res.status(200).json(tipo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar tipo de persona',
            error
        });
    }
});

/**
 * 🔹 DELETE /tipos-persona/:id
 * Baja lógica del tipo de persona
 */
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const tipo = await TipoPersonaModel.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de persona no encontrado' });
        }

        res.status(200).json({
            message: 'Tipo de persona dado de baja correctamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar tipo de persona',
            error
        });
    }
});

export default router;