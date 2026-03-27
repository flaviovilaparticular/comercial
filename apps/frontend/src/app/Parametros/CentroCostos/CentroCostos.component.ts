import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../header/header.component';
import { CentroCostosService } from '../../services/CentrosCostos.service';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

export interface CentroCostos {
    _id?: string;
    nombre: string;
    direccion: string;
    telefono?: string;
    email?: string;
    gerenteGeneral?: string;
    fechaCreacion?: Date;
}

@Component({
    selector: 'app-centro-costos',
    standalone: true,
    templateUrl: './CentroCostos.component.html',
    styleUrls: ['./CentroCostos.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent, HeaderSistemaComponent,]
})
export class CentroCostosComponent implements OnInit {

    centros: CentroCostos[] = [];
    mostrarModal = false;
    esEdicion = false;
    centroSeleccionado: CentroCostos | null = null;

    nuevoCentro: CentroCostos = {
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        gerenteGeneral: ''
    };

    constructor(
        private centroService: CentroCostosService,
        private router: Router,

    ) { }

    ngOnInit(): void {

        this.cargarCentros();
    }

    cargarCentros(): void {
        this.centroService.obtenerTodos().subscribe({
            next: data => this.centros = data,
            error: () => Swal.fire('❌ Error', 'No se pudieron cargar los centros de costos', 'error')
        });
    }

    abrirModal(centro?: CentroCostos): void {
        if (centro) {
            this.esEdicion = true;
            this.centroSeleccionado = centro;
            this.nuevoCentro = { ...centro };
        } else {
            this.esEdicion = false;
            this.centroSeleccionado = null;
            this.nuevoCentro = { nombre: '', direccion: '', telefono: '', email: '', gerenteGeneral: '' };
        }
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarCentro(): void {
        if (this.esEdicion && this.centroSeleccionado?._id) {
            this.centroService.actualizar(this.centroSeleccionado._id, this.nuevoCentro).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Centro actualizado', 'success');
                    this.cargarCentros();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar', 'error')
            });
        } else {
            this.centroService.crear(this.nuevoCentro).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Centro creado', 'success');
                    this.cargarCentros();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo crear', 'error')
            });
        }
    }

    eliminarCentro(id: string): void {
        Swal.fire({
            title: '¿Eliminar centro de costos?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(r => {
            if (r.isConfirmed) {
                this.centroService.eliminar(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Centro eliminado', 'success');
                        this.cargarCentros();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
