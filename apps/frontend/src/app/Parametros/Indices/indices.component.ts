import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IndicesService, Indice } from '../../services/indices.services';
import { HeaderComponent } from '../../header/header.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-indices',
    standalone: true,
    templateUrl: './indices.component.html',
    styleUrls: ['./indices.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent
    ]
})
export class IndicesComponent implements OnInit {

    indices: Indice[] = [];
    mostrarModal = false;

    // 🔹 FORMULARIO (alineado con backend)
    indiceForm = {
        tipo: 'DOLAR',          // ⚠️ debe coincidir con el enum
        nombre: '',
        valor: null,
        unidad: 'ARS',
        fechaVigencia: '',
        activo: true,
        observacion: ''
    };

    constructor(
        private indicesService: IndicesService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarIndices();
    }

    cargarIndices(): void {
        this.indicesService.obtenerTodos().subscribe({
            next: (data) => this.indices = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los índices', 'error')
        });
    }

    abrirModal(): void {
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
        this.resetForm();
    }
    guardarIndice(): void {

        const payload = {
            ...this.indiceForm,
            fechaVigencia: new Date(this.indiceForm.fechaVigencia)
        };

        console.log('Payload final:', payload);

        const payloadWithCorrectDate = {
            ...payload,
            fechaVigencia: new Date(this.indiceForm.fechaVigencia).toISOString() // Convert Date to string
        };

        this.indicesService.crear(payloadWithCorrectDate).subscribe({
            next: () => {
                Swal.fire('Éxito', 'Índice creado correctamente', 'success');
                this.cerrarModal();
                this.cargarIndices();
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', err.error?.detalle || 'No se pudo crear el índice', 'error');
            }
        });
    }




    resetForm(): void {
        /*      this.indiceForm = {
      
                  tipo: '',
                  nombre: '',
                  valor: 0,
                  unidad: 'ARS',
                  fechaVigencia: '',
                  activo: true
              };*/
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }
}
