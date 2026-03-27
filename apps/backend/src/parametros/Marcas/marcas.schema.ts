import * as mongoose from 'mongoose';

export interface IMarca extends mongoose.Document {
    nombre: string;
}

const MarcaSchema = new mongoose.Schema<IMarca>(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export const MarcaModel = mongoose.model<IMarca>('marcas', MarcaSchema);