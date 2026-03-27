import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RubroModel } from './rubros.schema';

const router = Router();

/* ===========================
   OBTENER TODOS LOS RUBROS
=========================== */
router.get('/', async (_req: Request, res: Response) => {
    try {
        const rubros = await RubroModel.find().sort({ nombre: 1 });
        res.json(rubros);
    } catch (error) {
        console.error('Error al obtener rubros:', error);
        res.status(500).json({ message: 'Error al obtener rubros', error });
    }
});

/* ===========================
   OBTENER RUBRO POR ID
=========================== */
router.get('/:id', async (req: Request, res: Response) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const rubro = await RubroModel.findById(req.params.id);

        if (!rubro) {
            return res.status(404).json({ message: 'Rubro no encontrado' });
        }

        res.json(rubro);

    } catch (error) {
        console.error('Error al obtener rubro:', error);
        res.status(500).json({ message: 'Error al obtener el rubro', error });
    }
});

/* ===========================
   CREAR RUBRO
=========================== */
router.post('/', async (req: Request, res: Response) => {
    try {

        const rubro = new RubroModel(req.body);
        const guardado = await rubro.save();

        res.status(201).json(guardado);

    } catch (error) {
        console.error('Error al crear rubro:', error);
        res.status(400).json({ message: 'Error al crear rubro', error });
    }
});

/* ===========================
   ACTUALIZAR RUBRO
=========================== */
router.put('/:id', async (req: Request, res: Response) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const rubro = await RubroModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!rubro) {
            return res.status(404).json({ message: 'Rubro no encontrado' });
        }

        res.json(rubro);

    } catch (error) {
        console.error('Error al actualizar rubro:', error);
        res.status(400).json({ message: 'Error al actualizar rubro', error });
    }
});

/* ===========================
   ELIMINAR RUBRO
=========================== */
router.delete('/:id', async (req: Request, res: Response) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const rubro = await RubroModel.findByIdAndDelete(req.params.id);

        if (!rubro) {
            return res.status(404).json({ message: 'Rubro no encontrado' });
        }

        res.json({ message: 'Rubro eliminado correctamente' });

    } catch (error) {
        console.error('Error al eliminar rubro:', error);
        res.status(500).json({ message: 'Error al eliminar rubro', error });
    }
});

export const RubrosRouter = router;