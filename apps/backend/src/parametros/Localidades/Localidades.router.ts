import { Router, Request, Response } from 'express';
import { LocalidadModel } from './Localidades.schema';

const router = Router();

router.get('/provincia/:idProvincia', async (req: Request, res: Response) => {
    try {
        const localidades = await LocalidadModel.find({ idProvincia: req.params.idProvincia });
        res.json(localidades);
    } catch (error) {
        console.error('Error al obtener localidades por provincia:', error);
        res.status(500).json({ message: 'Error al obtener localidades por provincia', error });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const localidades = await LocalidadModel.find().limit(100);
        res.json(localidades);
    } catch (error) {
        console.error('Error al obtener localidades:', error);
        res.status(500).json({ message: 'Error al obtener localidades', error });
    }
});


router.get('/:id', async (req: Request, res: Response) => {
    try {
        const localidad = await LocalidadModel.findById(req.params.id);
        if (!localidad) return res.status(404).json({ message: 'Localidad no encontrada' });
        res.json(localidad);
    } catch (error) {
        console.error('Error al obtener localidad:', error);
        res.status(500).json({ message: 'Error al obtener la localidad', error });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const localidad = new LocalidadModel(req.body);
        const guardada = await localidad.save();
        res.status(201).json(guardada);
    } catch (error) {
        console.error('Error al crear localidad:', error);
        res.status(400).json({ message: 'Error al crear localidad', error });
    }
});


export const LocalidadesRouter = router;