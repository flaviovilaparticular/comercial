import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';


// 🔹 Interfaz para Índice


// 🔹 Interfaz para Índice
export interface Indice {
    _id?: string;
    tipo: string;
    nombre: string;
    valor: number;
    unidad: string;
    fechaVigencia: string;
    activo?: boolean;
    observacion?: string;
}


@Injectable({
    providedIn: 'root'
})
export class IndicesService {
    private apiUrl = `${environment.apiUrl}/parametros/indices`;
    constructor(private http: HttpClient) { }

    // Obtener todos los índices
    obtenerTodos(): Observable<Indice[]> {
        return this.http.get<Indice[]>(`${this.apiUrl}/rmIndices`);
    }

    // Obtener el último índice vigente por tipo (ej: DOLAR)
    obtenerPorTipo(tipo: string): Observable<Indice> {
        return this.http.get<Indice>(`${this.apiUrl}/rmIndices/${tipo}`);
    }

    // ➕ Crear un nuevo índice
    crear(indice: Indice): Observable<any> {
        return this.http.post(`${this.apiUrl}/rIndices`, indice);
    }
}
