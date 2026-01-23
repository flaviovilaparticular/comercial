import { Schema, model } from 'mongoose';

const CentroideSchema = new Schema(
    {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    { _id: false }
);

const ProvinciasSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        centroide: {
            type: CentroideSchema,
            required: true
        }
    },
    {
        collection: 'provincias',
        timestamps: true
    }
);

export const ProvinciasModel = model('Provincias', ProvinciasSchema);
