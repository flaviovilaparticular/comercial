import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

    mostrarModalMarca = false;

    nombreNuevaMarca = '';
    mostrarModalRubro = false;

    nombreNuevoRubro = '';

    getProductoVacio() {
        return {
            codigo: '',
            nombre: '',
            descripcion: '',

            rubro: { _id: '', nombre: '' },
            marca: { _id: '', nombre: '' },

            unidadMedida: 'UNIDAD',
            stock: 0,
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
        private router: Router,
        private route: ActivatedRoute
    ) { }
    ngOnInit(): void {
        this.cargarProductos();
        this.cargarRubros();
        this.cargarMarcas();

        // 🌟 Si venimos desde Movimientos con la orden de abrir el formulario nuevo
        this.route.queryParams.subscribe(params => {
            if (params['abrirNuevo'] === 'true') {
                this.abrirModal();
            }
        });
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

    abrirModalMarca() {

        this.nombreNuevaMarca = '';

        this.mostrarModalMarca = true;

    }


    cerrarModalMarca() {

        this.mostrarModalMarca = false;

    }


    guardarMarcaRapida() {

        if (!this.nombreNuevaMarca.trim()) {

            Swal.fire('Error', 'Ingrese un nombre', 'warning');

            return;

        }

        this.marcasService
            .crearMarca({ nombre: this.nombreNuevaMarca })
            .subscribe({

                next: (marcaCreada: any) => {

                    Swal.fire('OK', 'Marca creada', 'success');

                    this.cargarMarcas();

                    this.nuevoProducto.marca._id = marcaCreada._id;

                    this.cerrarModalMarca();

                },

                error: () =>
                    Swal.fire('Error', 'No se pudo crear la marca', 'error')

            });

    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarProducto() {
        const rubroSeleccionado = this.rubros.find(r => r._id === (this.nuevoProducto.rubro?._id || this.nuevoProducto.rubro));
        const marcaSeleccionada = this.marcas.find(m => m._id === (this.nuevoProducto.marca?._id || this.nuevoProducto.marca));

        if (!rubroSeleccionado || !marcaSeleccionada) {
            Swal.fire('Atención', 'Debe seleccionar un rubro y una marca válidos', 'warning');
            return;
        }

        const costo = Number(this.nuevoProducto.precios?.costoNeto) || 0;
        const precioNeto = Number(this.nuevoProducto.precios?.precioVentaNeto) || 0;
        const precioFinal = Number(this.nuevoProducto.precios?.precioVentaFinal) || precioNeto;
        const margen = Number(this.nuevoProducto.precios?.margenGanancia) || 0;

        const payloadProducto: any = {
            ...this.nuevoProducto,

            rubro: {
                _id: rubroSeleccionado._id,
                nombre: rubroSeleccionado.nombre
            },
            marca: {
                _id: marcaSeleccionada._id,
                nombre: marcaSeleccionada.nombre
            },

            // 💡 Mandamos las propiedades de precio tanto en la raíz como en 'precios'
            // para satisfacer cualquier req.body.precio / req.body.valor / req.body.precioVenta
            precio: precioFinal,
            valor: precioFinal,
            precioVenta: precioFinal,
            precioVentaFinal: precioFinal,
            costoNeto: costo,

            precios: {
                costoNeto: costo,
                margenGanancia: margen,
                precioVentaNeto: precioNeto,
                precioVentaFinal: precioFinal
            },
            impuestos: {
                alicuotaIVA: String(this.nuevoProducto.impuestos?.alicuotaIVA || '21'),
                percepcionesAdicionales: Number(this.nuevoProducto.impuestos?.percepcionesAdicionales) || 0
            },
            stock: Number(this.nuevoProducto.stock) || 0,
            unidadMedida: this.nuevoProducto.unidadMedida || 'UNIDAD',
            estado: this.nuevoProducto.estado || 'ACTIVO'
        };

        if (this.esEdicion) {

            this.productosService.actualizarProducto(payloadProducto._id, payloadProducto)
                .subscribe({
                    next: () => {
                        Swal.fire('Actualizado', 'Producto actualizado correctamente', 'success');
                        this.cerrarModal();
                        this.cargarProductos();
                    },
                    error: (err) => {
                        console.error('Error al actualizar producto:', err.error || err);
                        Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar el producto', 'error');
                    }
                });

        } else {

            this.productosService.crearProducto(payloadProducto)
                .subscribe({
                    next: (respuesta: any) => {
                        Swal.fire('Creado', 'Producto creado correctamente', 'success');
                        this.cerrarModal();

                        const productoCreado = respuesta.data || respuesta;
                        const volverMovimientos = this.route.snapshot.queryParams['volverMovimientos'];

                        if (volverMovimientos === 'true' && productoCreado._id) {
                            this.router.navigate(['/movimientos'], {
                                queryParams: {
                                    productoCreadoId: productoCreado._id
                                }
                            });
                        } else {
                            this.cargarProductos();
                        }
                    },
                    error: (err) => {
                        console.error('Detalle exacto del error:', err.error || err);
                        Swal.fire('Error', err.error?.mensaje || 'Error al guardar el producto', 'error');
                    }
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

    abrirModalRubro() {

        this.nombreNuevoRubro = '';

        this.mostrarModalRubro = true;

    }


    cerrarModalRubro() {

        this.mostrarModalRubro = false;

    }


    guardarRubroRapido() {

        if (!this.nombreNuevoRubro.trim()) {

            Swal.fire('Error', 'Ingrese un nombre', 'warning');

            return;

        }

        this.rubrosService
            .crearRubro({ nombre: this.nombreNuevoRubro })
            .subscribe({

                next: (rubroCreado: any) => {

                    Swal.fire('OK', 'Rubro creado', 'success');

                    this.cargarRubros();

                    this.nuevoProducto.rubro._id = rubroCreado._id;

                    this.cerrarModalRubro();

                },

                error: () =>
                    Swal.fire('Error', 'No se pudo crear el rubro', 'error')

            });

    }

    volver(): void {
        this.router.navigate(['/menu']);
    }

}