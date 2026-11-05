import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class UserService {



    private apiUrl = `${environment.apiUrl}/parametros/auth`;

    constructor(private http: HttpClient) { }

    // 🔐 LOGIN
    login(dni: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { dni, password });
    }

    // 🧾 REGISTRO DE USUARIO
    register(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, user);
    }

    // 📋 Obtener todos los usuarios
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    // 🔍 Obtener un usuario por ID
    getUserById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${id}`);
    }

    // ✏️ Actualizar un usuario
    updateUser(id: string, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}`, user);
    }

    // 🗑️ Eliminar un usuario
    deleteUser(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
    }
}