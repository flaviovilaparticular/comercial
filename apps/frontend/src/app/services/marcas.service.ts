import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Marca {
    _id?: string;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class MarcasService {

    private apiUrl = 'http://localhost:3000/api/parametros/marcas';

    constructor(private http: HttpClient) { }

    /* ===========================
       OBTENER TODAS LAS MARCAS
    =========================== */
    getMarcas(): Observable<Marca[]> {
        return this.http.get<Marca[]>(this.apiUrl);
    }

    /* ===========================
       OBTENER MARCA POR ID
    =========================== */
    getMarca(id: string): Observable<Marca> {
        return this.http.get<Marca>(`${this.apiUrl}/${id}`);
    }

    /* ===========================
       CREAR MARCA
    =========================== */
    crearMarca(marca: Marca): Observable<Marca> {
        return this.http.post<Marca>(this.apiUrl, marca);
    }

    /* ===========================
       ACTUALIZAR MARCA
    =========================== */
    actualizarMarca(id: string, marca: Marca): Observable<Marca> {
        return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
    }

    /* ===========================
       ELIMINAR MARCA
    =========================== */
    eliminarMarca(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

}