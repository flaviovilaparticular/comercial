import { Router, Request, Response } from 'express';
import FormaDePago from './FormadePago.schema';

const router = Router();

/**
 * GET - Obtener todas las formas de pago
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const formasDePago = await FormaDePago
            .find({ activo: true })
            .sort({ nombre: 1 });

        res.status(200).json(formasDePago);
    } catch (error) {
        console.error('Error al obtener formas de pago:', error);
        res.status(500).json({
            message: 'Error al obtener las formas de pago'
        });
    }
});

/**
 * GET - Obtener forma de pago por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const formaDePago = await FormaDePago.findById(id);

        if (!formaDePago) {
            return res.status(404).json({
                message: 'Forma de pago no encontrada'
            });
        }

        res.status(200).json(formaDePago);
    } catch (error) {
        console.error('Error al obtener forma de pago:', error);
        res.status(500).json({
            message: 'Error al obtener la forma de pago'
        });
    }
});

/**
 * POST - Crear nueva forma de pago
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                message: 'El nombre es obligatorio'
            });
        }

        const existe = await FormaDePago.findOne({ nombre: nombre.trim() });

        if (existe) {
            return res.status(400).json({
                message: 'Ya existe una forma de pago con ese nombre'
            });
        }

        const nuevaFormaDePago = new FormaDePago({
            nombre: nombre.trim(),
            descripcion
        });

        await nuevaFormaDePago.save();

        res.status(201).json(nuevaFormaDePago);
    } catch (error) {
        console.error('Error al crear forma de pago:', error);
        res.status(500).json({
            message: 'Error al crear la forma de pago'
        });
    }
});

export default router;
