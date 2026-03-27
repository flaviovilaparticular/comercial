import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { HeaderComponent } from '../../header/header.component';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';

import { ProductosService, Producto } from '../../services/productos.service';
import { RubrosService } from '../../services/rubros.service';
import { MarcasService } from '../../services/marcas.service';

@Component({
    selector: 'app-productos',
    standalone: true,
    templateUrl: './productos.component.html',
    styleUrls: ['./productos.component.css'],
    imports: [CommonModule, FormsModule, HeaderComponent, HeaderSistemaComponent]
})
export class ProductosComponent implements OnInit {

    productos: Producto[] = [];
    rubros: any[] = [];
    marcas: any[] = [];

    mostrarModal = false;
    esEdicion = false;
    productoSeleccionado: Producto | null = null;

    nuevoProducto: Producto = this.getProductoVacio();

    getProductoVacio() {
        return {
            codigo: '',
            nombre: '',
            descripcion: '',

            rubro: { _id: '', nombre: '' },   // 👈 CLAVE
            marca: { _id: '', nombre: '' },   // 👈 CLAVE

            unidadMedida: 'UNIDAD',
            stockMinimo: 0,
            stockMaximo: 0,

            precios: {
                costoNeto: 0,
                margenGanancia: 0,
                precioVentaNeto: 0,
                precioVentaFinal: 0
            },

            impuestos: {
                alicuotaIVA: '21',
                percepcionesAdicionales: 0
            },

            estado: 'ACTIVO',

            observaciones: ''
        };
    }

    constructor(
        private productosService: ProductosService,
        private rubrosService: RubrosService,
        private marcasService: MarcasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarProductos();
        this.cargarRubros();
        this.cargarMarcas();
    }

    cargarProductos(): void {
        this.productosService.getProductos().subscribe({
            next: data => this.productos = data,
            error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
        });
    }
    cargarRubros(): void {
        this.rubrosService.getRubros().subscribe({
            next: data => {
                console.log('Rubros:', data); // 👈 ACÁ
                this.rubros = data;
            },
            error: err => {
                console.error('Error al cargar rubros:', err);
            }
        });
    }

    cargarMarcas(): void {
        this.marcasService.getMarcas().subscribe({
            next: data => this.marcas = data
        });
    }

    abrirModal(producto?: any) {

        if (producto) {

            this.esEdicion = true;

            this.nuevoProducto = JSON.parse(JSON.stringify(producto));

        } else {

            this.esEdicion = false;

            this.nuevoProducto = this.getProductoVacio();

        }

        this.calcularPrecios();

        this.mostrarModal = true;

    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarProducto() {

        const rubro = this.rubros.find(r => r._id === this.nuevoProducto.rubro._id);
        const marca = this.marcas.find(m => m._id === this.nuevoProducto.marca._id);

        if (!rubro || !marca) {
            Swal.fire('Error', 'Debe seleccionar rubro y marca', 'warning');
            return;
        }

        const producto = {
            ...this.nuevoProducto,

            rubro: {
                _id: rubro._id,
                nombre: rubro.nombre
            },

            marca: {
                _id: marca._id,
                nombre: marca.nombre
            }
        };

        if (this.esEdicion) {

            this.productosService.actualizarProducto(producto._id, producto)
                .subscribe({
                    next: () => {
                        Swal.fire('Actualizado', 'Producto actualizado correctamente', 'success');
                        this.cerrarModal();
                        this.cargarProductos();
                    },
                    error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
                });

        } else {

            this.productosService.crearProducto(producto)
                .subscribe({
                    next: () => {
                        Swal.fire('Creado', 'Producto creado correctamente', 'success');
                        this.cerrarModal();
                        this.cargarProductos();
                    },
                    error: () => Swal.fire('Error', 'No se pudo crear', 'error')
                });

        }

    }



    eliminarProducto(id: string): void {

        Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí eliminar'
        }).then(r => {

            if (r.isConfirmed) {

                this.productosService.eliminarProducto(id).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Producto eliminado', 'success');
                        this.cargarProductos();
                    },
                    error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
                });

            }

        });

    }

    calcularPrecios(): void {

        if (!this.nuevoProducto?.precios || !this.nuevoProducto?.impuestos) {
            return;
        }

        const costo =
            Number(this.nuevoProducto.precios.costoNeto) || 0;

        const margen =
            Number(this.nuevoProducto.precios.margenGanancia) || 0;

        const iva =
            Number(this.nuevoProducto.impuestos.alicuotaIVA) || 0;

        const percepciones =
            Number(this.nuevoProducto.impuestos.percepcionesAdicionales) || 0;


        // PRECIO NETO (sin impuestos)
        const precioVentaNeto =
            costo + (costo * margen / 100);


        // PRECIO FINAL (con IVA + percepciones)
        const precioVentaFinal =
            precioVentaNeto +
            (precioVentaNeto * iva / 100) +
            (precioVentaNeto * percepciones / 100);


        // REDONDEO COMERCIAL
        this.nuevoProducto.precios.precioVentaNeto =
            Number(precioVentaNeto.toFixed(2));

        this.nuevoProducto.precios.precioVentaFinal =
            Number(precioVentaFinal.toFixed(2));

    }

    volver(): void {
        this.router.navigate(['/menu']);
    }

}