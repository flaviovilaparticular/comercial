import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovimientosService, Movimiento, ItemMovimiento, FiltrosMovimientos } from '../services/movimientos.service';

@Component({
    selector: 'app-listado-movimientos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink
    ],
    templateUrl: './listadoMovimientos.component.html',
    styleUrls: ['./listadoMovimientos.component.css']
})
export class ListadoMovimientosComponent implements OnInit {

    // Control dinámico de entidad según la ruta/menú
    tipoEntidad: 'Proveedor' | 'Cliente' = 'Proveedor';
    tituloVista: string = 'Movimientos';

    // Colección de datos y estados
    movimientos: Movimiento[] = [];
    cargando: boolean = false;
    totalRegistros: number = 0;

    // Filtros vinculados con la interfaz
    filtros: FiltrosMovimientos = {
        tipoEntidad: 'Proveedor',
        formaDePago: '',
        fechaDesde: '',
        fechaHasta: ''
    };

    constructor(
        private movimientosService: MovimientosService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Escucha la configuración de la ruta activa al navegar por el menú
        this.route.data.subscribe(data => {
            if (data['tipoEntidad']) {
                this.tipoEntidad = data['tipoEntidad'];
                this.tituloVista = data['titulo'] || `Movimientos de ${this.tipoEntidad}s`;
                this.filtros.tipoEntidad = this.tipoEntidad;

                this.limpiarFiltros(false);
                this.cargarMovimientos();
            }
        });
    }

    cargarMovimientos(): void {
        this.cargando = true;

        // Clonamos y limpiamos parámetros vacíos para no romper la Query del backend
        const paramsLimpios: any = {};

        Object.keys(this.filtros).forEach(key => {
            const val = (this.filtros as any)[key];
            if (val !== null && val !== undefined && val !== '') {
                paramsLimpios[key] = val;
            }
        });

        console.log('Filtros limpios enviados:', paramsLimpios);

        this.movimientosService.getMovimientos(paramsLimpios).subscribe({
            next: (resp: any) => {
                console.log('Respuesta del Backend:', resp);
                this.movimientos = resp.movimientos || resp.data || (Array.isArray(resp) ? resp : []);
                this.totalRegistros = resp.total ?? this.movimientos.length;
                this.cargando = false;
            },
            error: (err) => {
                console.error('Error al obtener la lista de movimientos:', err);
                this.cargando = false;
            }
        });
    }

    aplicarFiltros(): void {
        this.cargarMovimientos();
    }

    limpiarFiltros(recargar: boolean = true): void {
        this.filtros = {
            tipoEntidad: this.tipoEntidad, // Preserva la entidad actual (Proveedor / Cliente)
            formaDePago: '',
            fechaDesde: '',
            fechaHasta: ''
        };

        if (recargar) {
            this.cargarMovimientos();
        }
    }

    get totalMontoFinal(): number {
        return this.movimientos.reduce((acc, mov) => acc + (mov.totalFinal || 0), 0);
    }
}