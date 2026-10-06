import * as mongoose from 'mongoose';

export type EstadoProducto = 'ACTIVO' | 'INACTIVO' | 'DISCONTINUADO';
export type TipoUnidad = 'UNIDAD' | 'KG' | 'G' | 'LT' | 'ML' | 'MT' | 'CM' | 'M2' | 'CAJA' | 'PACK';
export type TipoIVA = '0' | '10.5' | '21' | '27';

export interface IProducto extends mongoose.Document {
    codigo: string;
    nombre: string;
    descripcion?: string;

    marca: {
        _id: mongoose.Types.ObjectId;
        nombre: string;
    };

    rubro: {
        _id: mongoose.Types.ObjectId;
        nombre: string;
    };

    unidadMedida: TipoUnidad;

    // CAMPOS DE STOCK
    stock: number;         // <-- NUEVO: Stock real actual en el sistema
    stockMinimo?: number;
    stockMaximo?: number;

    precios: {
        costoNeto?: number;
        margenGanancia?: number;
        precioVentaNeto: number;
        precioVentaFinal: number;
    };

    impuestos: {
        alicuotaIVA: TipoIVA;
        percepcionesAdicionales?: number;
    };

    imagen?: string;

    estado: EstadoProducto;
    fechaAlta: Date;
    observaciones?: string;
}

const MarcaRefSchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'marcas', required: true },
        nombre: { type: String, required: true, trim: true }
    },
    { _id: false }
);

const RubroRefSchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'rubros', required: true },
        nombre: { type: String, required: true, trim: true }
    },
    { _id: false }
);

const PreciosSchema = new mongoose.Schema(
    {
        costoNeto: { type: Number, min: 0 },
        margenGanancia: { type: Number, min: 0 },
        precioVentaNeto: { type: Number, required: true, min: 0 },
        precioVentaFinal: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const ImpuestosSchema = new mongoose.Schema(
    {
        alicuotaIVA: {
            type: String,
            enum: ['0', '10.5', '21', '27'],
            required: true,
            default: '21'
        },
        percepcionesAdicionales: { type: Number, default: 0 }
    },
    { _id: false }
);

const ProductoSchema = new mongoose.Schema<IProducto>(
    {
        codigo: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
        },

        nombre: {
            type: String,
            required: true,
            trim: true
        },

        descripcion: {
            type: String,
            trim: true
        },

        marca: {
            type: MarcaRefSchema,
            required: true
        },

        rubro: {
            type: RubroRefSchema,
            required: true
        },

        unidadMedida: {
            type: String,
            enum: ['UNIDAD', 'KG', 'G', 'LT', 'ML', 'MT', 'CM', 'M2', 'CAJA', 'PACK'],
            required: true,
            default: 'UNIDAD'
        },

        // <-- NUEVO: Agregado el campo stock con valor inicial 0
        stock: {
            type: Number,
            required: true,
            default: 0
        },

        stockMinimo: {
            type: Number,
            min: 0,
            default: 0 // Opcional: Un valor por defecto ayuda a comparar lógicas fácilmente
        },

        stockMaximo: {
            type: Number,
            min: 0
        },

        precios: {
            type: PreciosSchema,
            required: true
        },

        impuestos: {
            type: ImpuestosSchema,
            required: true
        },

        imagen: {
            type: String
        },

        estado: {
            type: String,
            enum: ['ACTIVO', 'INACTIVO', 'DISCONTINUADO'],
            required: true,
            default: 'ACTIVO'
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

// ÍNDICE SUGERIDO: Facilita reportes de stock crítico o faltantes en Angular
ProductoSchema.index({ stock: 1 });

export const ProductoModel = mongoose.model<IProducto>('productos', ProductoSchema);