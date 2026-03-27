import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface ITipoDocumento extends mongoose.Document {
    nombre: string;     // Ej: "DNI", "CUIT", "Pasaporte"
    abreviatura: string; // Ej: "DNI", "CUIT", "PAS"
    mascara?: string;    // Opcional: para usar en Angular (ej: "99-99999999-9")
    activo: boolean;
}

const TipoDocumentoSchema = new Schema<ITipoDocumento>(
    {
        nombre: { type: String, required: true, unique: true },
        abreviatura: { type: String, required: true },
        mascara: { type: String }, // Muy útil para los inputs de Angular
        activo: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'tiposDocumento'
    }
);

export const TipoDocumentoModel = mongoose.model<ITipoDocumento>(
    'TipoDocumento',
    TipoDocumentoSchema
);