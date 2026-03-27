import * as mongoose from 'mongoose';

export interface IRubro extends mongoose.Document {
    nombre: string;
}

const RubroSchema = new mongoose.Schema<IRubro>(
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

export const RubroModel = mongoose.model<IRubro>('rubros', RubroSchema);