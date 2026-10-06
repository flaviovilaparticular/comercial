import mongoose, { Schema, Document } from 'mongoose';

export interface IMovimiento extends Document {
    tipoOperacion: 'COMPRA' | 'VENTA';
    tipoEntidad: 'Proveedor' | 'Cliente';


    tipoComprobante: string;
    nroComprobante: string;

    datosEntidad: {
        idEntidad: mongoose.Types.ObjectId;
        nombreRazonSocial: string;
        tipoDocumento: string;
        documentoNumero: string;
        condicionIVA: string;
        domicilio: Record<string, any>;
    };
    items: {
        producto: mongoose.Types.ObjectId;
        descripcion: string;
        cantidad: number;
        precio: number;        // Precio Neto Unitario
        alicuotaIVA: string;   // Ejemplo "21", "10.5", "0"
        montoIVA: number;      // El IVA calculado para este ítem (Neto * % * Cantidad)
        subtotal: number;      // Cantidad * precio (Neto)
    }[];
    subtotalNeto: number;      // Suma de todos los subtotales de los ítems
    totalIVA: number;          // Suma de todos los montos de IVA
    totalFinal: number;        // subtotalNeto + totalIVA
    formaDePago: 'CONTADO' | 'CTACORRIENTE' | 'CHEQUE' | 'TRANSFERENCIA';
    esCuentaCorriente: boolean;
    observaciones?: string;
    fechaAlta: Date;
}

const MovimientoSchema = new Schema<IMovimiento>(
    {
        tipoOperacion: {
            type: String,
            enum: ['COMPRA', 'VENTA'],
            required: true
        },
        tipoEntidad: {
            type: String,
            required: true,
            enum: ['Proveedor', 'Cliente']
        },
        // ---- 🇦🇷 CONFIGURACIÓN EN EL SCHEMA ----
        tipoComprobante: {
            type: String,
            required: true,
            trim: true // Limpia espacios vacíos al inicio/final
        },
        nroComprobante: {
            type: String,
            required: true,
            trim: true
        },
        datosEntidad: {
            idEntidad: {
                type: Schema.Types.ObjectId,
                required: true
            },
            nombreRazonSocial: { type: String, required: true },
            tipoDocumento: { type: String, required: true },
            documentoNumero: { type: String, required: true },
            condicionIVA: { type: String, required: true },
            domicilio: { type: Schema.Types.Mixed, required: true }
        },
        items: [
            {
                producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
                descripcion: { type: String, required: true },
                cantidad: { type: Number, required: true },
                precio: { type: Number, required: true },
                alicuotaIVA: { type: String, required: true, default: "21" },
                montoIVA: { type: Number, required: true, default: 0 },
                subtotal: { type: Number, required: true }
            }
        ],
        subtotalNeto: {
            type: Number,
            required: true,
            default: 0
        },
        totalIVA: {
            type: Number,
            required: true,
            default: 0
        },
        totalFinal: {
            type: Number,
            required: true,
            default: 0
        },
        formaDePago: {
            type: String,
            required: true,
            enum: ['CONTADO', 'CTACORRIENTE', 'CHEQUE', 'TRANSFERENCIA']
        },
        esCuentaCorriente: {
            type: Boolean,
            default: false
        },
        observaciones: {
            type: String,
            trim: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'movimientos',
        timestamps: true
    }
);

// ÍNDICES
MovimientoSchema.index({ fechaAlta: -1 });
MovimientoSchema.index({ 'datosEntidad.idEntidad': 1 }); // Corregido para que apunte bien al ID indexado
MovimientoSchema.index({ tipoOperacion: 1 });
// Nuevo índice: Te va a servir muchísimo para buscar rápido una factura específica por su número
MovimientoSchema.index({ nroComprobante: 1 });

export default mongoose.model<IMovimiento>('Movimiento', MovimientoSchema);