import { Router, Request, Response } from 'express';
import { IndicesModel } from './Indices.schema';

const router = Router();

/**
 * 📋 Obtener todos los índices
 */
router.get('/rmIndices', async (req: Request, res: Response) => {
    try {
        const indices = await IndicesModel.find()
            .sort({ fechaVigencia: -1 });

        res.json(indices);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener índices' });
    }
});

/**
 * 🔍 Obtener último índice vigente por tipo
 */
router.get('/rmIndices/:tipo', async (req: Request, res: Response) => {
    try {
        const { tipo } = req.params;

        const indice = await IndicesModel
            .findOne({ tipo, activo: true })
            .sort({ fechaVigencia: -1 });

        if (!indice) {
            return res.status(404).json({ mensaje: 'Índice no encontrado' });
        }

        res.json(indice);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener índice' });
    }
});

/**
 * ➕ Crear nuevo índice
 */
router.post('/rIndices', async (req: Request, res: Response) => {
    try {
        console.log('📥 Payload recibido:', req.body);

        const nuevoIndice = new IndicesModel(req.body);
        await nuevoIndice.save();

        res.status(201).json(nuevoIndice);

    } catch (error: any) {
        console.error('🔥 ERROR REAL:', error);

        res.status(500).json({
            mensaje: 'Error al crear índice',
            detalle: error.message
        });
    }
});



export default router;
