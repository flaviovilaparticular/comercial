import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// 📌 Interfaz para Sucursal
export interface ISucursal extends mongoose.Document {
    nombre: string;
    direccion: string; // ahora es solo texto
    telefono: string;
    email: string;
    encargado: string;
    fechaApertura: Date;
    activo: boolean;
}

// 📌 Interfaz para CentroCostos
export interface ICentroCostos extends mongoose.Document {
    nombre: string;
    direccion: string; // solo texto
    telefono: string;
    email: string;
    gerenteGeneral: string;
    fechaCreacion: Date;
    sucursales: ISucursal[];
}

// 📌 Subesquema de sucursal
const SucursalSchema = new Schema<ISucursal>({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String },
    email: { type: String },
    encargado: { type: String },
    fechaApertura: { type: Date },
    activo: { type: Boolean, default: true }
});

// 📌 Esquema principal de CentroCostos
const CentroCostosSchema = new Schema<ICentroCostos>({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String },
    email: { type: String },
    gerenteGeneral: { type: String },
    fechaCreacion: { type: Date, default: Date.now },
    sucursales: [SucursalSchema]
});

// 📌 Exportar el modelo
export const CentroCostosModel = mongoose.model<ICentroCostos>(
    'CentroCostos',
    CentroCostosSchema,
    'centrocostos'
);
