import { Router } from 'express';
import { ProvinciasModel as modelo } from './Provincias.schema';

const router = Router();

/* ------------------- PROVINCIAS ------------------- */

/**
 * GET /rmProvincias
 * Devuelve todas las provincias ordenadas por nombre
 */
router.get('/rmProvincias', async (_req, res) => {
    try {
        const data = await modelo.find().sort({ nombre: 1 }).lean();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener provincias.' });
    }
});

/**
 * GET /rmProvincias/:id
 * Devuelve una provincia por su _id
 */
router.get('/rmProvincias/:id', async (req, res) => {
    try {
        const doc = await modelo.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Provincia no encontrada.' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar provincia.' });
    }
});

/**
 * GET /rmProvincias/verificar-nombre/:nombre
 * Devuelve true si NO existe una provincia con ese nombre
 */
router.get('/rmProvincias/verificar-nombre/:nombre', async (req, res) => {
    try {
        const existe = await modelo.findOne({ nombre: req.params.nombre });
        res.json(!existe);
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar nombre.' });
    }
});

/**
 * POST /rProvincias
 * Crea una o varias provincias
 */
router.post('/rProvincias', async (req, res) => {
    try {
        const body = req.body;
        const newItem = Array.isArray(body)
            ? await modelo.insertMany(body)
            : await modelo.create(body);

        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear provincia.' });
    }
});

/**
 * PUT /rProvincias/:id
 * Actualiza una provincia (valida nombre único)
 */
router.put('/rProvincias/:id', async (req, res) => {
    try {
        const { nombre } = req.body;

        const existe = await modelo.findOne({
            nombre,
            _id: { $ne: req.params.id }
        });

        if (existe)
            return res.status(400).json({ error: 'Nombre ya registrado.' });

        const updated = await modelo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ error: 'Provincia no encontrada.' });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar provincia.' });
    }
});

/**
 * DELETE /rProvincias/:id
 * Elimina una provincia
 */
router.delete('/rProvincias/:id', async (req, res) => {
    try {
        const deleted = await modelo.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: 'Provincia no encontrada.' });

        res.json({ message: 'Provincia eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar provincia.' });
    }
});

export default router;
