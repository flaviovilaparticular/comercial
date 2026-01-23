import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🔹 Interfaz para Índice


// 🔹 Interfaz para Índice
export interface Indice {
    _id?: string;
    tipo: string;
    nombre: string;          // ✅ AGREGADO
    valor: number;
    unidad: string;          // ✅ AGREGADO
    fechaVigencia: string;
    activo?: boolean;
    observacion?: string;
}


@Injectable({
    providedIn: 'root'
})
export class IndicesService {


    private apiUrl = 'http://localhost:3000/api/parametros/indices';


    constructor(private http: HttpClient) { }

    // 📋 Obtener todos los índices
    obtenerTodos(): Observable<Indice[]> {
        return this.http.get<Indice[]>(`${this.apiUrl}/rmIndices`);
    }

    // 🔍 Obtener el último índice vigente por tipo (ej: DOLAR)
    obtenerPorTipo(tipo: string): Observable<Indice> {
        return this.http.get<Indice>(`${this.apiUrl}/rmIndices/${tipo}`);
    }

    // ➕ Crear un nuevo índice
    crear(indice: Indice): Observable<any> {
        return this.http.post(`${this.apiUrl}/rIndices`, indice);
    }
}
