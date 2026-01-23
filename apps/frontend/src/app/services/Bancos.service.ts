import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Banco {
    _id?: string;
    nombre: string;
    activo?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class BancosService {

    private apiUrl = 'http://localhost:3000/api/parametros/bancos';

    constructor(private http: HttpClient) { }

    /**
     * 🔹 Obtener todos los bancos activos
     */
    getBancos(): Observable<Banco[]> {
        return this.http.get<Banco[]>(this.apiUrl);
    }

    /**
     * 🔹 Obtener banco por ID
     */
    getBancoById(id: string): Observable<Banco> {
        return this.http.get<Banco>(`${this.apiUrl}/${id}`);
    }

    /**
     * 🔹 Crear banco
     */
    crearBanco(banco: Banco): Observable<Banco> {
        return this.http.post<Banco>(this.apiUrl, banco);
    }

    /**
     * 🔹 Actualizar banco
     */
    actualizarBanco(id: string, banco: Partial<Banco>): Observable<Banco> {
        return this.http.put<Banco>(`${this.apiUrl}/${id}`, banco);
    }

    /**
     * 🔹 Baja lógica del banco
     */
    eliminarBanco(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
