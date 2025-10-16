import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    dni: string;
    password: string;
    legajo?: string;
    nombre: string;
    apellido?: string;
    rol: string;
    email: string;
    idefector?: Types.ObjectId;
    idservicio?: Types.ObjectId;
    active?: boolean;
    permisos?: string[];
    telefono?: string;
    validationToken?: string;
    disclaimers?: {
        createdAt: Date;
        _id: Types.ObjectId;
    }[];
    comparePassword(passwordAttempt: string): Promise<boolean>;
}