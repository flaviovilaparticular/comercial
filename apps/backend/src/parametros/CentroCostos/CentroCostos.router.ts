import { Router } from 'express';
import { CentroCostosModel as modelo } from './CentroCostos.schema';

const router = Router();

/* ------------------- CENTROS DE COSTOS ------------------- */

/**
 * GET /rmCentroCostos
 * Devuelve todos los centros de costos ordenados por nombre (asc).
 */
router.get('/rmCentroCostos', async (req, res) => {
    try {
        const data = await modelo.find().sort({ nombre: 1 }).lean();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los centros de costos.' });
    }
});

/**
 * GET /rmCentroCostos/:id
 * Devuelve un centro de costos por su _id
 */
router.get('/rmCentroCostos/:id', async (req, res) => {
    try {
        const doc = await modelo.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Centro de costos no encontrado.' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el centro de costos.' });
    }
});

/**
 * GET /rmCentroCostos/verificar-nombre/:nombre
 * Devuelve true si no existe ningún centro de costos con ese nombre
 */
router.get('/rmCentroCostos/verificar-nombre/:nombre', async (req, res) => {
    try {
        const existe = await modelo.findOne({ nombre: req.params.nombre });
        res.json(!existe);
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar nombre.' });
    }
});

/**
 * POST /rCentroCostos
 * Crea uno o varios centros de costos
 */
router.post('/rCentroCostos', async (req, res) => {
    try {
        const body = req.body;
        let newItem;
        if (Array.isArray(body)) {
            newItem = await modelo.insertMany(body);
        } else {
            newItem = await modelo.create(body);
        }
        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear centro de costos.' });
    }
});

/**
 * PUT /rCentroCostos/:id
 * Actualiza un centro de costos (valida nombre único)
 */
router.put('/rCentroCostos/:id', async (req, res) => {
    try {
        const { nombre } = req.body;
        const existe = await modelo.findOne({ nombre, _id: { $ne: req.params.id } });
        if (existe) return res.status(400).json({ error: 'Nombre ya registrado.' });

        const updated = await modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Centro de costos no encontrado.' });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar centro de costos.' });
    }
});

/**
 * DELETE /rCentroCostos/:id
 * Elimina un centro de costos
 */
router.delete('/rCentroCostos/:id', async (req, res) => {
    try {
        const deleted = await modelo.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Centro de costos no encontrado.' });
        res.json({ message: 'Centro de costos eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar centro de costos.' });
    }
});

/* ------------------- SUCURSALES ------------------- */

/**
 * POST /rCentroCostos/:id/sucursales
 * Agrega una sucursal al centro de costos indicado
 */
router.post('/rCentroCostos/:id/sucursales', async (req, res) => {
    try {
        const centro = await modelo.findById(req.params.id);
        if (!centro) return res.status(404).json({ error: 'Centro de costos no encontrado.' });

        centro.sucursales.push(req.body);
        const updated = await centro.save();
        res.json({ message: 'Sucursal agregada correctamente.', data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar sucursal.' });
    }
});

/**
 * PUT /rCentroCostos/:id/sucursales/:sucursalId
 * Actualiza una sucursal específica
 */
router.put('/rCentroCostos/:id/sucursales/:sucursalId', async (req, res) => {
    try {
        const centro = await modelo.findById(req.params.id);
        if (!centro) return res.status(404).json({ error: 'Centro de costos no encontrado.' });

        const sucursal = centro.sucursales.find(s => s._id?.toString() === req.params.sucursalId);
        if (!sucursal) return res.status(404).json({ error: 'Sucursal no encontrada.' });

        Object.assign(sucursal, req.body);
        const updated = await centro.save();
        res.json({ message: 'Sucursal actualizada correctamente.', data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar sucursal.' });
    }
});

/**
 * DELETE /rCentroCostos/:id/sucursales/:sucursalId
 * Elimina una sucursal específica
 */
router.delete('/rCentroCostos/:id/sucursales/:sucursalId', async (req, res) => {
    try {
        const centro = await modelo.findById(req.params.id);
        if (!centro) return res.status(404).json({ error: 'Centro de costos no encontrado.' });

        const index = centro.sucursales.findIndex(s => s._id?.toString() === req.params.sucursalId);
        if (index === -1) return res.status(404).json({ error: 'Sucursal no encontrada.' });

        centro.sucursales.splice(index, 1);
        const updated = await centro.save();
        res.json({ message: 'Sucursal eliminada correctamente.', data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar sucursal.' });
    }
});

export default router
