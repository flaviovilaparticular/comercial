import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemMovimiento {
    producto: string; // ID del producto
    descripcion: string;
    cantidad: number;
    precio: number;        // Precio Neto Unitario
    alicuotaIVA: string;   // Ej: "21", "10.5", "0"
    montoIVA: number;      // El IVA calculado para este ítem
    subtotal: number;      // Cantidad * Precio (Neto)
}

export interface DatosEntidadMovimiento {
    idEntidad?: string;
    nombreRazonSocial: string;
    tipoDocumento: string;      // Ej: "CUIT"
    documentoNumero: string;    // Ej: "30712345678"
    condicionIVA: string;       // Ej: "RI"
    domicilio?: any;
}

export interface Movimiento {
    _id?: string;
    tipoOperacion: 'COMPRA' | 'VENTA';
    tipoEntidad: 'Proveedor' | 'Cliente';

    // ---- CAMPOS DE FACTURACIÓN AFIP ----
    tipoComprobante: string;   // Ej: 'FACTURA A', 'FACTURA B', 'NOTA DE CRÉDITO A', etc.
    nroComprobante: string;    // Ej: '0001-00001234'

    datosEntidad: DatosEntidadMovimiento;
    items: ItemMovimiento[];

    // ---- CAMPOS DE TOTALES ----
    subtotalNeto: number;
    totalIVA: number;
    totalFinal: number;

    formaDePago: 'CONTADO' | 'CTACORRIENTE' | 'CHEQUE' | 'TRANSFERENCIA' | string;
    esCuentaCorriente: boolean;
    observaciones?: string;
    fechaAlta?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// 🔹 NUEVA INTERFAZ PARA LOS FILTROS
export interface FiltrosMovimientos {
    tipoEntidad?: 'Proveedor' | 'Cliente' | string;
    entidadId?: string;
    formaDePago?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

// 🔹 INTERFAZ PARA LA RESPUESTA DEL BACKEND
export interface RespuestaMovimientos {
    ok: boolean;
    total: number;
    movimientos: Movimiento[];
}

@Injectable({
    providedIn: 'root'
})
export class MovimientosService {

    private apiUrl = 'http://localhost:3000/api/movimientos'; // Ajustar según tu entorno

    constructor(private http: HttpClient) { }

    /**
     * Obtiene la lista de movimientos. 
     * Soporta filtros opcionales por query params (tipoEntidad, entidadId, formaDePago, fechas).
     */
    getMovimientos(filtros?: FiltrosMovimientos): Observable<RespuestaMovimientos> {
        let params = new HttpParams();

        if (filtros) {
            if (filtros.tipoEntidad) {
                params = params.set('tipoEntidad', filtros.tipoEntidad);
            }
            if (filtros.entidadId) {
                params = params.set('entidadId', filtros.entidadId);
            }
            if (filtros.formaDePago) {
                params = params.set('formaDePago', filtros.formaDePago);
            }
            if (filtros.fechaDesde) {
                params = params.set('fechaDesde', filtros.fechaDesde);
            }
            if (filtros.fechaHasta) {
                params = params.set('fechaHasta', filtros.fechaHasta);
            }
        }

        return this.http.get<RespuestaMovimientos>(this.apiUrl, { params });
    }

    getMovimiento(id: string): Observable<Movimiento> {
        return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
    }

    crearMovimiento(movimiento: Movimiento): Observable<Movimiento> {
        return this.http.post<Movimiento>(this.apiUrl, movimiento);
    }

    actualizarMovimiento(id: string, movimiento: Movimiento): Observable<Movimiento> {
        return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
    }

    eliminarMovimiento(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}