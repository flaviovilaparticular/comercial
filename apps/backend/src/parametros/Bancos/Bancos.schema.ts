import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IBanco extends mongoose.Document {
    nombre: string;
    activo: boolean;
}

const BancoSchema = new Schema<IBanco>(
    {
        nombre: { type: String, required: true, unique: true },
        activo: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        collection: 'bancos'
    }
);

export const BancoModel = mongoose.model<IBanco>(
    'Banco',
    BancoSchema
);
