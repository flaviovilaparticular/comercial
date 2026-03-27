import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rubro {
    _id?: string;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class RubrosService {

    private apiUrl = 'http://localhost:3000/api/parametros/rubros';

    constructor(private http: HttpClient) { }

    getRubros(): Observable<Rubro[]> {
        return this.http.get<Rubro[]>(this.apiUrl);
    }

    getRubro(id: string): Observable<Rubro> {
        return this.http.get<Rubro>(`${this.apiUrl}/${id}`);
    }

    crearRubro(rubro: Rubro): Observable<Rubro> {
        return this.http.post<Rubro>(this.apiUrl, rubro);
    }

    actualizarRubro(id: string, rubro: Rubro): Observable<Rubro> {
        return this.http.put<Rubro>(`${this.apiUrl}/${id}`, rubro);
    }

    eliminarRubro(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

}