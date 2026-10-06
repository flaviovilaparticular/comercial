import * as mongoose from 'mongoose';

export type TipoOperacionCC = 'COMPRA' | 'VENTA';
export type TipoEntidadCC = 'Cliente' | 'Proveedor';
export type EstadoCuentaCorriente = 'PENDIENTE' | 'CANCELADA';

export interface IDatosEntidadCC {
    nombreRazonSocial: string;
    tipoDocumento: string;
    documentoNumero: string;
    condicionIVA?: string;
}

export interface IDatosPagoCC {
    tipoComprobante?: string;
    nroComprobante?: string;
    monto?: number;
    formaDePago?: string;
    fechaPago?: Date | null;
    idMovimientoPago?: mongoose.Types.ObjectId | null;
}

export interface ICuentaCorriente extends mongoose.Document {
    idMovimiento: mongoose.Types.ObjectId;
    tipoOperacion: TipoOperacionCC;
    tipoEntidad: TipoEntidadCC;
    idEntidad: mongoose.Types.ObjectId;

    // Snapshot de la persona / empresa
    datosEntidad: IDatosEntidadCC;

    // Datos de la Factura / Deuda
    tipoComprobante: string;
    nroComprobante: string;
    montoTotal: number;
    fechaEmision: Date;

    // Control de Estado
    estado: EstadoCuentaCorriente;

    // Se completa cuando entra el Pago/Cobro
    datosPago: IDatosPagoCC;

    fechaAlta: Date;
    observaciones?: string;
}

const DatosEntidadSchema = new mongoose.Schema(
    {
        nombreRazonSocial: { type: String, required: true, trim: true },
        tipoDocumento: { type: String, required: true },
        documentoNumero: { type: String, required: true, trim: true },
        condicionIVA: { type: String }
    },
    { _id: false }
);

const DatosPagoSchema = new mongoose.Schema(
    {
        tipoComprobante: { type: String, default: '' },
        nroComprobante: { type: String, default: '' },
        monto: { type: Number, default: 0 },
        formaDePago: { type: String, default: '' },
        fechaPago: { type: Date, default: null },
        idMovimientoPago: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'movimientos',
            default: null
        }
    },
    { _id: false }
);

const CuentaCorrienteSchema = new mongoose.Schema<ICuentaCorriente>(
    {
        idMovimiento: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'movimientos',
            required: true,
            index: true
        },

        tipoOperacion: {
            type: String,
            enum: ['COMPRA', 'VENTA'],
            required: true
        },

        tipoEntidad: {
            type: String,
            enum: ['Cliente', 'Proveedor'],
            required: true
        },

        idEntidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'entidades',
            required: true,
            index: true
        },

        datosEntidad: {
            type: DatosEntidadSchema,
            required: true
        },

        tipoComprobante: {
            type: String,
            required: true
        },

        nroComprobante: {
            type: String,
            required: true,
            trim: true
        },

        montoTotal: {
            type: Number,
            required: true
        },

        fechaEmision: {
            type: Date,
            required: true
        },

        estado: {
            type: String,
            enum: ['PENDIENTE', 'CANCELADA'],
            default: 'PENDIENTE',
            index: true
        },

        datosPago: {
            type: DatosPagoSchema,
            default: () => ({})
        },

        fechaAlta: {
            type: Date,
            default: Date.now
        },

        observaciones: String
    },
    {
        versionKey: false,
        timestamps: true
    }
);

// Índice compuesto para acelerar las búsquedas de saldo pendiente por cliente/proveedor
CuentaCorrienteSchema.index({ idEntidad: 1, estado: 1 });

export const CuentaCorrienteModel = mongoose.model<ICuentaCorriente>('cuentas_corrientes', CuentaCorrienteSchema);
