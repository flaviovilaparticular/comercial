import { Schema, model } from 'mongoose';

export enum TipoIndice {
    DOLAR = 'DOLAR'
}

const IndicesSchema = new Schema(
    {
        tipo: {
            type: String,
            enum: Object.values(TipoIndice),
            required: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        valor: {
            type: Number,
            required: true
        },
        unidad: {
            type: String,
            required: true, // 'ARS', '%', etc.
            default: 'ARS'
        },
        fechaVigencia: {
            type: Date,
            required: true
        },
        activo: {
            type: Boolean,
            default: true
        },
        observacion: {
            type: String
        }
    },
    {
        collection: 'indices',
        timestamps: true
    }
);

// Solo un índice activo por tipo (ej: un solo DOLAR activo)
IndicesSchema.index(
    { tipo: 1, activo: 1 },
    { unique: true, partialFilterExpression: { activo: true } }
);

export const IndicesModel = model('Indices', IndicesSchema);
