import * as express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
const jwt = require('jsonwebtoken');
import { User } from '../users/user.schema';

dotenv.config();

const router = express.Router();

/**
 * 🔐 LOGIN
 */
router.post('/login', async (req: Request, res: Response) => {
    const { dni, password } = req.body;

    console.log('🔹 Solicitud de login recibida con body:', req.body);

    try {
        const user = await User.findOne({ dni });
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const payload = {
            id: user._id,
            dni: user.dni,
            legajo: user.legajo,
            nombre: user.nombre,
            rol: user.rol,
            idefector: user.idefector,
            idservicio: user.idservicio,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login exitoso', token, user: payload });

    } catch (error) {
        console.error('❌ Error en /login:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 🧾 REGISTRO DE NUEVO USUARIO
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        // 🔹 Limpia los campos vacíos ("") para evitar errores de tipo en Mongoose
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === '') req.body[key] = null;
        });

        // 🔹 Extrae los datos ya limpios
        const { dni, password, legajo, nombre, rol, idefector, idservicio, email } = req.body;

        // 🔹 Verifica duplicados por DNI o email
        const existingUser = await User.findOne({ $or: [{ dni }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe (DNI o email duplicado)' });
        }

        // 🔹 Crea y guarda el nuevo usuario
        const newUser = new User({
            dni,
            password,
            legajo,
            nombre,
            rol,
            idefector,
            idservicio,
            email
        });

        await newUser.save();

        // 🔹 Respuesta limpia
        res.status(201).json({
            message: '✅ Usuario creado correctamente',
            user: {
                id: newUser._id,
                dni: newUser.dni,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            }
        });

    } catch (error) {
        console.error('❌ Error en /register:', error);
        res.status(500).json({ message: 'Error en el servidor', error: (error as any).message });
    }
});


/**
 * 📋 LISTAR TODOS LOS USUARIOS (sin contraseña)
 */
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error('❌ Error en /users:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 🆕 CREAR USUARIO (para admin)
 */
router.post('/users', async (req: Request, res: Response) => {
    const { dni, password, legajo, nombre, rol, idefector, idservicio, email } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ dni }, { email }] });
        if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });

        const newUser = new User({ dni, password, legajo, nombre, rol, idefector, idservicio, email });
        await newUser.save();

        res.status(201).json({
            message: 'Usuario creado correctamente',
            user: { id: newUser._id, dni: newUser.dni, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol }
        });
    } catch (error) {
        console.error('❌ Error en POST /users:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * 🔍 OBTENER USUARIO POR ID
 */
router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        console.error('❌ Error en GET /users/:id:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

/**
 * ✏️ ACTUALIZAR USUARIO
 */
/**
 * ✏️ ACTUALIZAR USUARIO (seguro y compatible con edición sin contraseña)
 */
router.put('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Si no se envía password, eliminarlo del update
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        // Si se envía password nueva, encriptarla
        if (updateData.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
        console.error('❌ Error en PUT /users/:id:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});


/**
 * ELIMINAR USUARIO
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado', user: deletedUser });
    } catch (error) {
        console.error('❌ Error en DELETE /users/:id:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

export default router;