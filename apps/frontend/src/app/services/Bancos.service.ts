import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

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

    private apiUrl = `${environment.apiUrl}/parametros/bancos`;

    constructor(private http: HttpClient) { }

    getBancos(): Observable<Banco[]> {
        return this.http.get<Banco[]>(this.apiUrl);
    }

    getBancoById(id: string): Observable<Banco> {
        return this.http.get<Banco>(`${this.apiUrl}/${id}`);
    }

    crearBanco(banco: Banco): Observable<Banco> {
        return this.http.post<Banco>(this.apiUrl, banco);
    }

    actualizarBanco(id: string, banco: Partial<Banco>): Observable<Banco> {
        return this.http.put<Banco>(`${this.apiUrl}/${id}`, banco);
    }

    eliminarBanco(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}