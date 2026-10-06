import { Router, Request, Response } from 'express';
import { ProductoModel } from './productos.schema';
import * as mongoose from 'mongoose';
import { verifyToken } from '../auth/auth.middleware';

const router = Router();

/**
 * 🔹 GET /productos
 * Obtener todos los productos
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const productos = await ProductoModel.find().sort({ nombre: 1 });
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo productos',
            error
        });
    }
});

/**
 * 🔹 GET /productos/rubro/:idRubro
 * Obtener productos por rubro
 */
router.get('/rubro/:idRubro', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idRubro } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idRubro)) {
            return res.status(400).json({
                ok: false,
                message: 'ID de rubro inválido'
            });
        }

        const productos = await ProductoModel.find({ 'rubro._id': idRubro }).sort({ nombre: 1 });
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo productos por rubro',
            error
        });
    }
});

/**
 * 🔹 GET /productos/marca/:idMarca
 * Obtener productos por marca
 */
router.get('/marca/:idMarca', verifyToken, async (req: Request, res: Response) => {
    try {
        const { idMarca } = req.params;

        if (!mongoose.Types.ObjectId.isValid(idMarca)) {
            return res.status(400).json({
                ok: false,
                message: 'ID de marca inválido'
            });
        }

        const productos = await ProductoModel.find({ 'marca._id': idMarca }).sort({ nombre: 1 });
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo productos por marca',
            error
        });
    }
});

/**
 * 🔹 GET /productos/:id
 * Obtener producto por ID
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const producto = await ProductoModel.findById(id);

        if (!producto) {
            return res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error obteniendo producto',
            error
        });
    }
});

/**
 * 🔹 POST /productos
 * Crear producto
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {

    console.log("BODY RECIBIDO:", req.body);

    // 1. Extraemos el precio buscando dentro del objeto 'precios' o en la raíz por compatibilidad
    const precioFinal = req.body.precios?.precioVentaFinal ?? req.body.precio;

    // 2. Validamos que exista y que sea un número estrictamente mayor a 0
    if (precioFinal === undefined || precioFinal === null || Number(precioFinal) <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "El valor del producto debe ser mayor a 0."
        });
    }

    try {
        const nuevoProducto = new ProductoModel(req.body);
        const productoGuardado = await nuevoProducto.save();

        res.status(201).json(productoGuardado);

    } catch (error) {
        console.error("ERROR GUARDANDO PRODUCTO:", error);
        res.status(400).json({
            ok: false,
            error
        });
    }
});

/**
 * 🔹 PUT /productos/:id
 * Actualizar producto
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        // 1. Extraemos el precio del body para validarlo
        const { precio } = req.body;

        // 2. Validamos que el valor sea mayor a 0 si es que viene en el body
        if (precio !== undefined && (precio === null || precio <= 0)) {
            return res.status(400).json({
                ok: false,
                message: 'El valor del producto debe ser mayor a 0.'
            });
        }

        const productoActualizado = await ProductoModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Producto actualizado',
            data: productoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: 'Error actualizando producto',
            error
        });
    }
});
/**
 * 🔹 DELETE /productos/:id
 * Eliminar producto
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                message: 'ID inválido'
            });
        }

        const productoEliminado = await ProductoModel.findByIdAndDelete(id);

        if (!productoEliminado) {
            return res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Error eliminando producto',
            error
        });
    }
});

export const ProductosRouter = router;