import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, Rubro } from '../../services/rubros.service';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

const Swal = require('sweetalert2');

@Component({
    selector: 'app-rubros-abm',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, HeaderSistemaComponent],
    templateUrl: './rubros.component.html',
    styleUrls: ['./rubros.component.css']
})
export class RubrosAbmComponent implements OnInit {

    rubros: Rubro[] = [];
    rubroSeleccionado: Rubro | null = null;
    mostrarModal = false;
    esEdicion = false;

    nuevoRubro: Rubro = {
        nombre: ''
    };

    constructor(
        private rubrosService: RubrosService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarRubros();
    }

    cargarRubros(): void {
        this.rubrosService.getRubros().subscribe({
            next: (data) => this.rubros = data,
            error: (err) => console.error('Error al obtener rubros', err)
        });
    }

    abrirModal(rubro?: Rubro): void {
        if (rubro) {
            this.esEdicion = true;
            this.rubroSeleccionado = { ...rubro };
            this.nuevoRubro = { ...rubro };
        } else {
            this.esEdicion = false;
            this.nuevoRubro = { nombre: '' };
            this.rubroSeleccionado = null;
        }
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarRubro(): void {

        if (this.esEdicion && this.rubroSeleccionado?._id) {

            this.rubrosService.actualizarRubro(
                this.rubroSeleccionado._id,
                this.nuevoRubro
            ).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Rubro actualizado correctamente', 'success');
                    this.cargarRubros();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar el rubro', 'error')
            });

        } else {

            this.rubrosService.crearRubro(this.nuevoRubro).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Rubro creado correctamente', 'success');
                    this.cargarRubros();
                    this.cerrarModal();
                },
                error: (err) => {
                    Swal.fire('❌ Error', 'No se pudo crear el rubro', 'error');
                    console.error(err);
                }
            });

        }

    }

    eliminarRubro(id: string): void {

        Swal.fire({
            title: '¿Eliminar rubro?',
            text: 'Esta acción eliminará el rubro',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {

            if (result.isConfirmed) {

                this.rubrosService.eliminarRubro(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Rubro eliminado correctamente', 'success');
                        this.cargarRubros();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar el rubro', 'error')
                });

            }

        });

    }

    volver(): void {
        this.router.navigate(['/menu']);
    }

}