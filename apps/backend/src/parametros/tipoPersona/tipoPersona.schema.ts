import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface ITipoPersona extends mongoose.Document {
    nombre: string;
    descripcion?: string; // Opcional, por si quieres aclarar algo
    activo: boolean;
}

const TipoPersonaSchema = new Schema<ITipoPersona>(
    {
        nombre: { type: String, required: true, unique: true },
        descripcion: { type: String },
        activo: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'tiposPersona' // Nombre de la colección en la DB
    }
);

export const TipoPersonaModel = mongoose.model<ITipoPersona>(
    'TipoPersona',
    TipoPersonaSchema
);