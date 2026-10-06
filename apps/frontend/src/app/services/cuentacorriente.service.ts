import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces ---

export interface DatosPago {
    tipoComprobante?: string;
    nroComprobante?: string;
    monto?: number;
    formaDePago?: string;
    fechaPago?: Date | string;
    idMovimientoPago?: string | null;
}

export interface CuentaCorriente {
    _id?: string;
    idEntidad: string;
    tipoEntidad?: string;      // ej: 'Cliente', 'Proveedor'
    tipoOperacion?: string;    // ej: 'VENTA', 'COMPRA'
    nroComprobante?: string;   // Agregado para ver en grilla
    idMovimiento: string;
    montoTotal: number;
    estado?: 'PENDIENTE' | 'CANCELADA' | string;
    fechaEmision?: Date | string;
    datosPago?: DatosPago;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RespuestaSaldo {
    ok: boolean;
    data: {
        _id?: string;
        totalAdeudado: number;
        cantidadPendientes: number;
    };
}

export interface RespuestaGenerica {
    ok: boolean;
    message: string;
    data?: CuentaCorriente;
}

@Injectable({
    providedIn: 'root'
})
export class CuentaCorrienteService {

    // URL ajustada al prefijo en singular de tu main.ts
    private apiUrl = 'http://localhost:3000/api/cuentacorriente';

    constructor(private http: HttpClient) { }

    /**
     * 🔹 Obtener registros con filtros por Query Params
     * Para el modal: { idEntidad: '...', tipoEntidad: 'Proveedor', tipoOperacion: 'COMPRA' }
     */
    getCuentasCorrientes(filtros?: {
        idEntidad?: string;
        estado?: string;
        tipoEntidad?: string;
        tipoOperacion?: string;
    }): Observable<CuentaCorriente[]> {
        let params = new HttpParams();

        if (filtros) {
            if (filtros.idEntidad) params = params.set('idEntidad', filtros.idEntidad);
            if (filtros.estado) params = params.set('estado', filtros.estado);
            if (filtros.tipoEntidad) params = params.set('tipoEntidad', filtros.tipoEntidad);
            if (filtros.tipoOperacion) params = params.set('tipoOperacion', filtros.tipoOperacion);
        }

        return this.http.get<CuentaCorriente[]>(this.apiUrl, { params });
    }

    /**
     * 🔹 Obtener saldo total y cantidad de facturas pendientes de una entidad
     */
    getSaldoPorEntidad(idEntidad: string): Observable<RespuestaSaldo> {
        return this.http.get<RespuestaSaldo>(`${this.apiUrl}/saldo/${idEntidad}`);
    }

    /**
     * 🔹 Obtener registro por ID
     */
    getCuentaCorrienteById(id: string): Observable<CuentaCorriente> {
        return this.http.get<CuentaCorriente>(`${this.apiUrl}/${id}`);
    }

    /**
     * 🔹 Crear nueva cuenta corriente
     */
    crearCuentaCorriente(cuenta: CuentaCorriente): Observable<CuentaCorriente> {
        return this.http.post<CuentaCorriente>(this.apiUrl, cuenta);
    }

    /**
     * 🔹 Cancelar / Pagar registro
     */
    cancelarCuentaCorriente(id: string, datosPago: DatosPago): Observable<RespuestaGenerica> {
        return this.http.put<RespuestaGenerica>(`${this.apiUrl}/${id}/cancelar`, datosPago);
    }

    /**
     * 🔹 Actualización general del registro
     */
    actualizarCuentaCorriente(id: string, cuenta: Partial<CuentaCorriente>): Observable<RespuestaGenerica> {
        return this.http.put<RespuestaGenerica>(`${this.apiUrl}/${id}`, cuenta);
    }

    /**
     * 🔹 Eliminar registro
     */
    eliminarCuentaCorriente(id: string): Observable<RespuestaGenerica> {
        return this.http.delete<RespuestaGenerica>(`${this.apiUrl}/${id}`);
    }
}