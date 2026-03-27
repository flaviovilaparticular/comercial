import { Router, Request, Response } from 'express';
import { TipoDocumentoModel } from './tipoDocumento.schema';
import * as mongoose from 'mongoose';

const router = Router();

/**
 * 🔹 GET /tipos-documento
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const tipos = await TipoDocumentoModel
            .find({ activo: true })
            .sort({ nombre: 1 });

        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener tipos de documento',
            error
        });
    }
});

/**
 * 🔹 POST /tipos-documento
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, abreviatura, mascara } = req.body;

        if (!nombre || !abreviatura) {
            return res.status(400).json({
                message: 'El nombre y la abreviatura son obligatorios'
            });
        }

        const existe = await TipoDocumentoModel.findOne({ nombre });
        if (existe) {
            return res.status(400).json({ message: 'El tipo de documento ya existe' });
        }

        const tipo = new TipoDocumentoModel({
            nombre,
            abreviatura,
            mascara
        });

        await tipo.save();
        res.status(201).json(tipo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear tipo de documento',
            error
        });
    }
});

/**
 * 🔹 PUT /tipos-documento/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, abreviatura, mascara, activo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const tipo = await TipoDocumentoModel.findByIdAndUpdate(
            id,
            { nombre, abreviatura, mascara, activo },
            { new: true }
        );

        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de documento no encontrado' });
        }

        res.status(200).json(tipo);
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar tipo de documento',
            error
        });
    }
});

/**
 * 🔹 DELETE /tipos-documento/:id (Baja lógica)
 */
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const tipo = await TipoDocumentoModel.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de documento no encontrado' });
        }

        res.status(200).json({ message: 'Tipo de documento dado de baja' });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar tipo de documento',
            error
        });
    }
});

export default router;