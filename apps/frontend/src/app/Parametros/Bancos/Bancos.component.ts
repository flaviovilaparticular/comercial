import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BancosService, Banco } from '../../services/Bancos.service';
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';

const Swal = require('sweetalert2');

@Component({
    selector: 'app-bancos-abm',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent],
    templateUrl: './Bancos.component.html',
    styleUrls: ['./Bancos.component.css']
})
export class BancosAbmComponent implements OnInit {

    bancos: Banco[] = [];
    bancoSeleccionado: Banco | null = null;
    mostrarModal = false;
    esEdicion = false;

    nuevoBanco: Banco = {
        nombre: ''
    };

    constructor(
        private bancosService: BancosService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarBancos();
    }

    cargarBancos(): void {
        this.bancosService.getBancos().subscribe({
            next: (data) => this.bancos = data,
            error: (err) => console.error('Error al obtener bancos', err)
        });
    }

    abrirModal(banco?: Banco): void {
        if (banco) {
            this.esEdicion = true;
            this.bancoSeleccionado = { ...banco };
            this.nuevoBanco = { ...banco };
        } else {
            this.esEdicion = false;
            this.nuevoBanco = { nombre: '' };
            this.bancoSeleccionado = null;
        }
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarBanco(): void {
        if (this.esEdicion && this.bancoSeleccionado?._id) {
            this.bancosService.actualizarBanco(
                this.bancoSeleccionado._id,
                this.nuevoBanco
            ).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Banco actualizado correctamente', 'success');
                    this.cargarBancos();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar el banco', 'error')
            });
        } else {
            this.bancosService.crearBanco(this.nuevoBanco).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Banco creado correctamente', 'success');
                    this.cargarBancos();
                    this.cerrarModal();
                },
                error: (err) => {
                    Swal.fire('❌ Error', 'No se pudo crear el banco', 'error');
                    console.error(err);
                }
            });
        }
    }

    eliminarBanco(id: string): void {
        Swal.fire({
            title: '¿Eliminar banco?',
            text: 'Esta acción desactiva el banco',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.bancosService.eliminarBanco(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Banco eliminado correctamente', 'success');
                        this.cargarBancos();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar el banco', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
