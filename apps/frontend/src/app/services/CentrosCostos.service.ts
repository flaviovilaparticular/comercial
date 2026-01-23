import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🔹 Interfaz para Sucursal
export interface Sucursal {
    _id?: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    encargado?: string;
    fechaApertura?: Date;
    activo?: boolean;
}

// 🔹 Interfaz para CentroCostos
export interface CentroCostos {
    _id?: string;
    nombre: string;
    direccion: string;
    telefono?: string;
    email?: string;
    gerenteGeneral?: string;
    fechaCreacion?: Date;
    sucursales?: Sucursal[];
}

@Injectable({
    providedIn: 'root'
})
export class CentroCostosService {
    private apiUrl = 'http://localhost:3000/api/parametros/centro-costos';


    constructor(private http: HttpClient) { }

    /** ---------------- CENTROS DE COSTOS ---------------- */

    obtenerTodos(): Observable<CentroCostos[]> {
        return this.http.get<CentroCostos[]>(`${this.apiUrl}/rmCentroCostos`);
    }

    obtenerPorId(id: string): Observable<CentroCostos> {
        return this.http.get<CentroCostos>(`${this.apiUrl}/rmCentroCostos/${id}`);
    }

    verificarNombre(nombre: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/rmCentroCostos/verificar-nombre/${nombre}`);
    }

    crear(centro: CentroCostos | CentroCostos[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/rCentroCostos`, centro);
    }

    actualizar(id: string, centro: CentroCostos): Observable<any> {
        return this.http.put(`${this.apiUrl}/rCentroCostos/${id}`, centro);
    }

    eliminar(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/rCentroCostos/${id}`);
    }

    /** ---------------- SUCURSALES ---------------- */

    agregarSucursal(idCentro: string, sucursal: Sucursal): Observable<any> {
        return this.http.post(`${this.apiUrl}/rCentroCostos/${idCentro}/sucursales`, sucursal);
    }

    actualizarSucursal(idCentro: string, idSucursal: string, sucursal: Sucursal): Observable<any> {
        return this.http.put(`${this.apiUrl}/rCentroCostos/${idCentro}/sucursales/${idSucursal}`, sucursal);
    }

    eliminarSucursal(idCentro: string, idSucursal: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/rCentroCostos/${idCentro}/sucursales/${idSucursal}`);
    }
}
