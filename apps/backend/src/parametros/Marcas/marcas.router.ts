import { Router, Request, Response } from 'express';
import { MarcaModel } from './marcas.schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const marcas = await MarcaModel.find().sort({ nombre: 1 });
        res.json(marcas);
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({ message: 'Error al obtener marcas', error });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const marca = await MarcaModel.findById(req.params.id);
        if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
        res.json(marca);
    } catch (error) {
        console.error('Error al obtener marca:', error);
        res.status(500).json({ message: 'Error al obtener la marca', error });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const marca = new MarcaModel(req.body);
        const guardada = await marca.save();
        res.status(201).json(guardada);
    } catch (error) {
        console.error('Error al crear marca:', error);
        res.status(400).json({ message: 'Error al crear marca', error });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const marca = await MarcaModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
        res.json(marca);
    } catch (error) {
        console.error('Error al actualizar marca:', error);
        res.status(400).json({ message: 'Error al actualizar marca', error });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const marca = await MarcaModel.findByIdAndDelete(req.params.id);
        if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
        res.json({ message: 'Marca eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar marca:', error);
        res.status(500).json({ message: 'Error al eliminar marca', error });
    }
});

export const MarcasRouter = router;