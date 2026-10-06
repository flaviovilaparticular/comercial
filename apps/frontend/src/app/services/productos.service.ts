import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
    _id?: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    rubro: { _id: string; nombre: string };
    marca: { _id: string; nombre: string };
    unidadMedida: string;

    // NUEVO CAMPO AGREGADO ACÁ
    stock: number;

    stockMinimo?: number;
    stockMaximo?: number;
    precios: {
        costoNeto?: number;
        margenGanancia?: number;
        precioVentaNeto: number;
        precioVentaFinal: number;
    };

    impuestos: {
        alicuotaIVA: string;
        percepcionesAdicionales?: number;
    };
    estado: string;
    observaciones?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductosService {

    private apiUrl = 'http://localhost:3000/api/productos';

    constructor(private http: HttpClient) { }

    /**
     * 🔹 Headers con token
     */
    private getHeaders() {
        const token = localStorage.getItem('token');

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * 🔹 Obtener todos los productos
     */
    getProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Obtener producto por ID
     */
    getProducto(id: string): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Obtener productos por rubro
     */
    getProductosPorRubro(idRubro: string): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/rubro/${idRubro}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Obtener productos por marca
     */
    getProductosPorMarca(idMarca: string): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/marca/${idMarca}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Crear producto
     */
    crearProducto(producto: Producto): Observable<any> {
        return this.http.post(this.apiUrl, producto, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Actualizar producto
     */
    actualizarProducto(id: string, producto: Producto): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, producto, {
            headers: this.getHeaders()
        });
    }

    /**
     * 🔹 Eliminar producto
     */
    eliminarProducto(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

}