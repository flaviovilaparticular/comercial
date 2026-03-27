import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcasService, Marca } from '../../services/marcas.service';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

const Swal = require('sweetalert2');

@Component({
    selector: 'app-marcas-abm',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent, HeaderSistemaComponent],
    templateUrl: './marcas.component.html',
    styleUrls: ['./marcas.component.css']
})
export class MarcasAbmComponent implements OnInit {

    marcas: Marca[] = [];
    marcaSeleccionada: Marca | null = null;
    mostrarModal = false;
    esEdicion = false;

    nuevaMarca: Marca = {
        nombre: ''
    };

    constructor(
        private marcasService: MarcasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarMarcas();
    }

    cargarMarcas(): void {
        this.marcasService.getMarcas().subscribe({
            next: (data) => this.marcas = data,
            error: (err) => console.error('Error al obtener marcas', err)
        });
    }

    abrirModal(marca?: Marca): void {
        if (marca) {
            this.esEdicion = true;
            this.marcaSeleccionada = { ...marca };
            this.nuevaMarca = { ...marca };
        } else {
            this.esEdicion = false;
            this.nuevaMarca = { nombre: '' };
            this.marcaSeleccionada = null;
        }
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarMarca(): void {

        if (this.esEdicion && this.marcaSeleccionada?._id) {

            this.marcasService.actualizarMarca(
                this.marcaSeleccionada._id,
                this.nuevaMarca
            ).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Marca actualizada correctamente', 'success');
                    this.cargarMarcas();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar la marca', 'error')
            });

        } else {

            this.marcasService.crearMarca(this.nuevaMarca).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Marca creada correctamente', 'success');
                    this.cargarMarcas();
                    this.cerrarModal();
                },
                error: (err) => {
                    Swal.fire('❌ Error', 'No se pudo crear la marca', 'error');
                    console.error(err);
                }
            });

        }

    }

    eliminarMarca(id: string): void {

        Swal.fire({
            title: '¿Eliminar marca?',
            text: 'Esta acción eliminará la marca',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {

            if (result.isConfirmed) {

                this.marcasService.eliminarMarca(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Marca eliminada correctamente', 'success');
                        this.cargarMarcas();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar la marca', 'error')
                });

            }

        });

    }

    volver(): void {
        this.router.navigate(['/menu']);
    }

}