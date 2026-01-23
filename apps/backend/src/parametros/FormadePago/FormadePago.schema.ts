import mongoose, { Schema, Document } from 'mongoose';

export interface IFormaDePago extends Document {
    nombre: string;
    descripcion?: string;
    activo: boolean;
    fechaAlta: Date;
}

const FormaDePagoSchema = new Schema<IFormaDePago>(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        descripcion: {
            type: String,
            trim: true
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'formasDePago'
    }
);

export default mongoose.model<IFormaDePago>(
    'FormaDePago',
    FormaDePagoSchema
);
