import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* =========================
   Interfaces
========================= */

export type TipoPersona = 'FISICA' | 'JURIDICA';
export type TipoDocumento = 'CUIT' | 'CUIL' | 'DNI' | 'PASAPORTE';
export type CondicionIVA = 'RI' | 'MONOTRIBUTO' | 'EXENTO' | 'FINAL';

export interface Domicilio {
    calle?: string;
    pisoDepto?: string;
    localidad?: string;
    provincia?: string;
    codigoPostal?: string;
}

export interface Contacto {
    telefonoPrincipal?: string;
    telefonoSecundario?: string;
    email?: string;
    web?: string;
}

export interface Entidad {
    _id?: string;

    tipoPersona: TipoPersona;

    nombreRazonSocial: string;
    nombreFantasia?: string;

    tipoDocumento: TipoDocumento;
    documentoNumero: string;
    condicionIVA: CondicionIVA;

    domicilio?: Domicilio;
    contacto?: Contacto;

    fechaAlta?: Date;
    activo?: boolean;

    observacionesGenerales?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class EntidadesService {

    private apiUrl = 'http://localhost:3000/api/parametros/entidades';

    constructor(private http: HttpClient) { }

    /* =========================
       GETS
    ========================= */

    // 🔹 Obtener todas
    getEntidades(): Observable<Entidad[]> {
        return this.http.get<Entidad[]>(this.apiUrl);
    }

    getProveedores(): Observable<Entidad[]> {
        return this.http.get<Entidad[]>(`${this.apiUrl}/proveedores`);
    }
    // 🔹 Obtener por ID
    getEntidadById(id: string): Observable<Entidad> {
        return this.http.get<Entidad>(`${this.apiUrl}/${id}`);
    }

    /* =========================
       POST
    ========================= */

    // 🔹 Crear
    crearEntidad(entidad: Entidad): Observable<any> {
        return this.http.post(this.apiUrl, entidad);
    }

    /* =========================
       PUT
    ========================= */

    // 🔹 Actualizar
    actualizarEntidad(id: string, entidad: Partial<Entidad>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, entidad);
    }

    /* =========================
       DELETE (por si luego lo agregás)
    ========================= */

    eliminarEntidad(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
