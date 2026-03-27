import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { EntidadesService, Entidad } from '../../services/entidades.service';
import { NgForm } from '@angular/forms';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

@Component({
    selector: 'app-entidades',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, HeaderSistemaComponent],
    templateUrl: './Entidades.component.html',
    styleUrls: ['./Entidades.component.css']

})
export class EntidadesComponent implements OnInit {

    entidades: Entidad[] = [];
    mostrarModal = false;
    esEdicion = false;

    nuevaEntidad: Entidad = this.getEntidadVacia();

    constructor(private entidadesService: EntidadesService) { }

    ngOnInit() {
        this.cargarEntidades();
    }

    getEntidadVacia(): Entidad {
        return {
            tipoPersona: 'FISICA',
            nombreRazonSocial: '',
            tipoDocumento: 'DNI',
            documentoNumero: '',
            condicionIVA: 'FINAL',
            contacto: {}
        };
    }

    cargarEntidades() {
        this.entidadesService.getEntidades()
            .subscribe(data => this.entidades = data);
    }

    abrirModal(entidad?: Entidad) {
        this.mostrarModal = true;

        if (entidad) {
            this.esEdicion = true;
            this.nuevaEntidad = { ...entidad };
        } else {
            this.esEdicion = false;
            this.nuevaEntidad = this.getEntidadVacia();
        }
    }

    cerrarModal() {
        this.mostrarModal = false;
    }

    guardarEntidad(form: NgForm) {

        // Validación real
        if (form.invalid) {
            form.control.markAllAsTouched();
            return;
        }

        if (this.esEdicion && this.nuevaEntidad._id) {

            this.entidadesService
                .actualizarEntidad(this.nuevaEntidad._id, this.nuevaEntidad)
                .subscribe({
                    next: () => {
                        this.cargarEntidades();
                        this.cerrarModal();
                    },
                    error: (err) => {
                        console.error('Error al actualizar:', err);
                    }
                });

        } else {

            this.entidadesService
                .crearEntidad(this.nuevaEntidad)
                .subscribe({
                    next: () => {
                        this.cargarEntidades();
                        this.cerrarModal();
                    },
                    error: (err) => {
                        console.error('Error al crear:', err);
                    }
                });

        }
    }

    eliminarEntidad(id: string) {
        this.entidadesService
            .eliminarEntidad(id)
            .subscribe(() => this.cargarEntidades());
    }

    volver() {
        history.back();
    }
}
