import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILocalidad extends Document {
    codLocalidad?: string;
    codBahra?: string;
    departamento?: string;
    nombre: string;
    codigoPostal?: string;
    codigoProvincia?: number;
    codDepartamento?: string;
    provincia: {
        nombre: string;
        _id: Types.ObjectId;
    };
}

const LocalidadSchema = new Schema<ILocalidad>(
    {
        codLocalidad: { type: String },
        codBahra: { type: String },
        departamento: { type: String },
        nombre: { type: String, required: true, trim: true },
        codigoPostal: { type: String },
        codigoProvincia: { type: Number },
        codDepartamento: { type: String },
        provincia: {
            nombre: { type: String, required: true },
            _id: { type: Schema.Types.ObjectId, ref: 'Provincias', required: true }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ✅ Export con nombre
export const LocalidadModel = mongoose.model<ILocalidad>('Localidad', LocalidadSchema, 'Localidades');