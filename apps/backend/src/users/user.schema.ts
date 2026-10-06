import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IUser } from './user.interface';

// Definición del esquema de Usuario (simplificado)
const UserSchema = new Schema<IUser>({
    dni: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    rol: { type: String, required: true, trim: true }
}, {
    timestamps: true // 🔹 opcional: agrega createdAt y updatedAt
});

//  Hashear la contraseña antes de guardar
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

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);
