import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IUser } from './user.interface';

const UserSchema = new Schema<IUser>({
    dni: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // 🔹 Opcionales
    legajo: { type: String, unique: true, sparse: true, default: null },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, trim: true, default: null },
    rol: { type: String, required: true, trim: true },

    // 🔹 Email obligatorio
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    telefono: { type: String, default: null },
    permisos: [{ type: String, default: [] }],

    // 🔹 Referencias opcionales
    idefector: { type: Schema.Types.ObjectId, ref: 'Efector', required: false, default: null },
    idservicio: { type: Schema.Types.ObjectId, ref: 'Servicio', required: false, default: null },

    active: { type: Boolean, default: true },
    validationToken: { type: String, default: null },

    disclaimers: [{
        createdAt: { type: Date, default: Date.now }
    }]
});

// 🔒 Hashear la contraseña antes de guardar
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as any);
    }
});

// 🔍 Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);