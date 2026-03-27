import * as mongoose from 'mongoose';

export type TipoPersona = 'FISICA' | 'JURIDICA';
export type TipoDocumento = 'CUIT' | 'CUIL' | 'DNI' | 'PASAPORTE';
export type CondicionIVA = 'RI' | 'MONOTRIBUTO' | 'EXENTO' | 'FINAL';

export interface IEntidad extends mongoose.Document {
    tipoPersona: TipoPersona;

    nombreRazonSocial: string;
    nombreFantasia?: string;

    tipoDocumento: TipoDocumento;
    documentoNumero: string;
    condicionIVA: CondicionIVA;

    domicilio: {
        calle?: string;
        pisoDepto?: string;
        localidad?: string;
        provincia?: string;
        codigoPostal?: string;
    };

    contacto: {
        telefonoPrincipal?: string;
        telefonoSecundario?: string;
        email?: string;
        web?: string;
    };

    fechaAlta: Date;
    activo: boolean;
    observacionesGenerales?: string;
}

const DomicilioSchema = new mongoose.Schema(
    {
        calle: String,
        pisoDepto: String,
        localidad: String,
        provincia: String,
        codigoPostal: String
    },
    { _id: false }
);

const ContactoSchema = new mongoose.Schema(
    {
        telefonoPrincipal: String,
        telefonoSecundario: String,
        email: { type: String, lowercase: true, trim: true },
        web: String
    },
    { _id: false }
);

const EntidadSchema = new mongoose.Schema<IEntidad>(
    {
        tipoPersona: {
            type: String,
            enum: ['FISICA', 'JURIDICA'],
            required: true
        },

        nombreRazonSocial: {
            type: String,
            required: true,
            trim: true
        },

        nombreFantasia: {
            type: String,
            trim: true
        },

        tipoDocumento: {
            type: String,
            enum: ['CUIT', 'CUIL', 'DNI', 'PASAPORTE'],
            required: true
        },

        documentoNumero: {
            type: String,
            required: true,
            trim: true,
            index: true
            // unique: true  ← activalo si querés que no se repita
        },

        condicionIVA: {
            type: String,
            enum: ['RI', 'MONOTRIBUTO', 'EXENTO', 'FINAL'],
            required: true
        },

        domicilio: DomicilioSchema,
        contacto: ContactoSchema,

        fechaAlta: {
            type: Date,
            default: Date.now
        },

        activo: {
            type: Boolean,
            default: true
        },

        observacionesGenerales: String
    },
    {
        versionKey: false,
        timestamps: true // opcional pero MUY recomendable
    }
);

export const EntidadModel = mongoose.model<IEntidad>('entidades', EntidadSchema);
