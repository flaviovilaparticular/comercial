import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovimientosService, Movimiento, ItemMovimiento } from '../services/movimientos.service';
import { HeaderComponent } from '../header/header.component';
import { HeaderSistemaComponent } from '../header/header-sistema.component';

import { ProductosService, Producto } from '../services/productos.service';
import { EntidadesService, Entidad } from '../services/entidades.service';
import Swal from 'sweetalert2';
import { ElementRef, ViewChild /* ...otros imports */ } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';


declare var bootstrap: any;

@Component({
    selector: 'app-movimientos',
    templateUrl: './movimientos.component.html',
    styleUrls: ['./movimientos.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        HeaderSistemaComponent,
        RouterModule
    ]
})
export class MovimientosComponent implements OnInit {
    @ViewChild('inputNroComprobante') inputNroComprobante!: ElementRef<HTMLInputElement>;
    // 1. Estado del Formulario
    listaEntidades: Entidad[] = [];
    entidadesFiltradas: Entidad[] = [];
    entidadCreadaId: string | null = null;
    tipo: 'VENTA' | 'COMPRA' = 'VENTA';
    tipoEntidad: 'Cliente' | 'Proveedor' = 'Cliente';

    // 2. Listas y Búsquedas
    entidades: any[] = [];
    formasDePago = [
        { id: 'CONTADO', nombre: 'Contado / Efectivo' },
        { id: 'CTACORRIENTE', nombre: 'Cuenta Corriente' },
        { id: 'CHEQUE', nombre: 'Cheque' },
        { id: 'TRANSFERENCIA', nombre: 'Transferencia Bancaria' } // Por si la usás más adelante
    ];
    cuitBusqueda: string = '';
    busquedaProducto: string = '';
    busquedaEntidad: string = '';
    cantidadCarga: number = 1;

    // Lista para la grilla del modal con tipado estricto
    productos: Producto[] = [];
    productosFiltradosModal: Producto[] = [];
    fechaActual: string = '';
    comprobanteTipo: string = 'FACTURA';
    comprobanteLetra: string = 'A';

    // 3. El objeto que vamos a construir
    nuevoMovimiento: Movimiento = {
        tipoOperacion: 'VENTA',
        tipoEntidad: 'Cliente',

        // 🇦🇷 CAMPOS AFIP AGREGADOS:
        tipoComprobante: 'FACTURA A',
        nroComprobante: '0001-00000001', // 👈 Poné un valor por defecto provisorio acá

        datosEntidad: {
            idEntidad: '',
            nombreRazonSocial: '',
            tipoDocumento: '',
            documentoNumero: '',
            condicionIVA: '',
            domicilio: {}
        },
        items: [],
        subtotalNeto: 0,
        totalIVA: 0,
        totalFinal: 0,
        formaDePago: 'CONTADO',
        esCuentaCorriente: false,
        observaciones: '',


    };

    // Variables auxiliares
    productoSeleccionado: Producto | null = null;

    // Instancias privadas de los modales de Bootstrap
    private modalBusquedaInstance: any;
    private modalBusquedaEntidadInstance: any;

    constructor(
        private movimientosService: MovimientosService,
        private route: ActivatedRoute,
        private productosService: ProductosService,
        private entidadesService: EntidadesService,
        private router: Router,
    ) { }
    // 1. Array estático con tus formas de pago reales


    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const tipoParam = params.get('tipo');
            console.log('TIPO PARAM:', tipoParam);

            if (tipoParam === 'COMPRA' || tipoParam === 'VENTA') {
                this.cambiarTipo(tipoParam);
            }
        });

        this.route.queryParams.subscribe(params => {
            // Leemos cualquiera de las dos formas en las que pueda llegar la URL
            const entidadCreada = params['entidadCreada'] || params['entidadCreadaId'];

            if (entidadCreada) {
                this.entidadCreadaId = entidadCreada;
            }
        });

        // Cargamos productos y entidades reales al iniciar el componente
        this.cargarProductos();
        this.cargarEntidades();
        this.setearFechaDeHoy();

        // Inicializamos el modal de Productos
        const modalElement = document.getElementById('modalBusquedaProducto');
        if (modalElement) {
            this.modalBusquedaInstance = new bootstrap.Modal(modalElement);
        }

        // Inicializamos el modal de Entidades
        const modalEntidadElement = document.getElementById('modalBusquedaEntidad');
        if (modalEntidadElement) {
            this.modalBusquedaEntidadInstance = new bootstrap.Modal(modalEntidadElement);
        }
    }

    setearFechaDeHoy() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        // Padding con '0' para que meses/días de un solo dígito tengan dos (ej: 06, 03)
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');

        // Armamos el string YYYY-MM-DD que entiende el navegador
        this.fechaActual = `${anio}-${mes}-${dia}`;
    }
    // --- LÓGICA DE INTERFAZ ---
    cambiarTipo(nuevoTipo: 'VENTA' | 'COMPRA') {
        this.tipo = nuevoTipo;
        this.tipoEntidad = (nuevoTipo === 'VENTA') ? 'Cliente' : 'Proveedor';
        this.nuevoMovimiento.tipoOperacion = nuevoTipo;
        this.nuevoMovimiento.tipoEntidad = this.tipoEntidad;

        this.busquedaEntidad = ''; // Limpiamos la búsqueda al cambiar de tipo
    }
    actualizarTipoComprobante(): void {
        console.log('El tipo de comprobante cambió a:', this.comprobanteTipo);
        // Acá va la lógica que necesites ejecutar cuando cambie el select
    }

    // Agrega este método en tu componente .ts
    onFormaPagoChange() {
        // Si el usuario elige Cuenta Corriente, seteamos el flag en true automáticamente
        if (this.nuevoMovimiento.formaDePago === 'CTACORRIENTE') {
            this.nuevoMovimiento.esCuentaCorriente = true;
        } else {
            this.nuevoMovimiento.esCuentaCorriente = false;
        }
    }
    cargarEntidades(): void {
        this.entidadesService.getEntidades().subscribe({
            next: (data) => {
                this.listaEntidades = data.filter(e => e.activo !== false);
                this.filtrarEntidadesPorOperacion();

                if (this.entidadCreadaId) {
                    const entidadRecienCreada = this.listaEntidades.find(
                        e => e._id === this.entidadCreadaId
                    );

                    if (entidadRecienCreada) {
                        // 1. Seleccionamos la entidad en el formulario
                        this.seleccionarEntidad(entidadRecienCreada);

                        // 2. Limpiamos la URL para remover el queryParam
                        this.limpiarQueryParams();
                    }

                    this.entidadCreadaId = null;
                }
            },
            error: (err) => {
                console.error('Error al cargar las entidades en movimientos', err);
            }
        });
    }

    limpiarQueryParams(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                entidadCreada: null,
                entidadCreadaId: null
            },
            queryParamsHandling: 'merge', // Mantiene otros parámetros si existieran
            replaceUrl: true // Reemplaza la entrada en el historial del navegador para que no pueda volver atrás a esa URL
        });
    }

    filtrarEntidadesPorOperacion(): void {
        // Al unificar las entidades, pasamos la lista completa para ambas operaciones
        this.entidadesFiltradas = this.listaEntidades;
    }

    formatearCuit() {
        let numeros = this.cuitBusqueda.replace(/\D/g, '');
        numeros = numeros.substring(0, 11);

        if (numeros.length > 2 && numeros.length <= 10) {
            this.cuitBusqueda = numeros.replace(/^(\d{2})(\d+)/, '$1-$2');
        }
        if (numeros.length > 10) {
            this.cuitBusqueda = numeros.replace(/^(\d{2})(\d{8})(\d{1}).*/, '$1-$2-$3');
        }
        if (numeros.length <= 2) {
            this.cuitBusqueda = numeros;
        }
    }

    cargarProductos(): void {
        this.productosService
            .getProductos()
            .subscribe({
                next: (data) => {
                    this.productos = data;
                    this.productosFiltradosModal = data;
                },
                error: (err) => {
                    console.error('Error al cargar productos:', err);
                }
            });
    }

    // --- LÓGICA DE BÚSQUEDA Y MODAL DE PRODUCTOS ---
    buscarProducto() {
        if (!this.busquedaProducto.trim()) {
            this.abrirModalBusquedaAvanzada();
            return;
        }

        const resultados = this.filtrarProductos(this.busquedaProducto);

        if (resultados.length === 1) {
            this.seleccionarProducto(resultados[0]);
            this.agregarItem();
        } else {
            this.productosFiltradosModal = resultados;
            if (this.modalBusquedaInstance) this.modalBusquedaInstance.show();
        }
    }

    abrirModalBusquedaAvanzada() {
        this.productosFiltradosModal = this.filtrarProductos(this.busquedaProducto);
        if (this.modalBusquedaInstance) this.modalBusquedaInstance.show();
    }

    filtrarProductosEnModal() {
        this.productosFiltradosModal = this.filtrarProductos(this.busquedaProducto);
    }

    filtrarProductos(termino: string): Producto[] {
        if (!termino) return this.productos;

        const terminoLower = termino.toLowerCase();
        return this.productos.filter(p =>
            (p.nombre && p.nombre.toLowerCase().includes(terminoLower)) ||
            (p.codigo && p.codigo.toLowerCase().includes(terminoLower))
        );
    }

    seleccionarProductoDesdeModal(producto: Producto) {
        this.seleccionarProducto(producto);
        this.agregarItem();
        if (this.modalBusquedaInstance) this.modalBusquedaInstance.hide();
    }

    seleccionarProducto(producto: Producto) {
        this.productoSeleccionado = producto;
    }

    // --- LÓGICA DE BÚSQUEDA Y MODAL DE ENTIDADES ---
    buscarEntidad() {
        if (!this.busquedaEntidad.trim()) {
            this.abrirModalBusquedaEntidadAvanzada();
            return;
        }

        const resultados = this.filtrarEntidades(this.busquedaEntidad);

        if (resultados.length === 1) {
            this.seleccionarEntidad(resultados[0]);
        } else {
            this.entidadesFiltradas = resultados;
            if (this.modalBusquedaEntidadInstance) this.modalBusquedaEntidadInstance.show();
        }
    }


    abrirModalBusquedaEntidadAvanzada() {
        this.entidadesFiltradas = this.filtrarEntidades(this.busquedaEntidad);
        if (this.modalBusquedaEntidadInstance) this.modalBusquedaEntidadInstance.show();
    }

    filtrarEntidadesEnModal() {
        this.entidadesFiltradas = this.filtrarEntidades(this.busquedaEntidad);
    }

    filtrarEntidades(termino: string): Entidad[] {
        if (!termino) return this.listaEntidades;

        const terminoLower = termino.toLowerCase();
        return this.listaEntidades.filter(e =>
            (e.nombreRazonSocial && e.nombreRazonSocial.toLowerCase().includes(terminoLower)) ||
            (e.nombreFantasia && e.nombreFantasia.toLowerCase().includes(terminoLower)) ||
            (e.documentoNumero && e.documentoNumero.includes(terminoLower))
        );
    }

    seleccionarEntidadDesdeModal(entidad: Entidad) {
        this.seleccionarEntidad(entidad);
        if (this.modalBusquedaEntidadInstance) this.modalBusquedaEntidadInstance.hide();
    }

    seleccionarEntidad(entidad: Entidad) {
        // ❌ BORRAMOS esta línea vieja que te da el error:
        // this.nuevoMovimiento.entidad = entidad._id || '';

        this.busquedaEntidad = `${entidad.nombreRazonSocial} (${entidad.documentoNumero})`;

        // 🌟 ACÁ ADENTRO asignamos el idEntidad como corresponde en la nueva estructura:
        this.nuevoMovimiento.datosEntidad = {
            idEntidad: entidad._id || '', // 👈 Mapeamos el ID acá adentro
            nombreRazonSocial: entidad.nombreRazonSocial || '',
            tipoDocumento: entidad.tipoDocumento || 'CUIT',
            documentoNumero: entidad.documentoNumero || '',
            condicionIVA: entidad.condicionIVA || 'RI',
            domicilio: entidad.domicilio || { calle: '', numero: '' }
        };
    }

    // --- LÓGICA DE ÍTEMS ---
    agregarItem() {
        if (!this.productoSeleccionado) return;

        // 1. Para VENTA usamos el precio NETO, el IVA se calcula aparte.
        const precioSeleccionado = this.tipo === 'VENTA'
            ? (this.productoSeleccionado.precios.precioVentaNeto || 0)
            : (this.productoSeleccionado.precios.costoNeto || 0);

        // 2. Extraemos la alícuota del producto (por defecto "21")
        const alicuota = this.productoSeleccionado.impuestos?.alicuotaIVA || "21";

        // 3. Calculamos los subtotales del ítem
        const subtotalNeto = precioSeleccionado * this.cantidadCarga;
        const porcentajeIVA = parseFloat(alicuota) || 0;
        const totalMontoIVA = subtotalNeto * (porcentajeIVA / 100);

        const nuevoItem: ItemMovimiento = {
            producto: this.productoSeleccionado._id || '',
            descripcion: this.productoSeleccionado.nombre,
            cantidad: this.cantidadCarga,
            precio: precioSeleccionado,
            alicuotaIVA: alicuota,       // 👈 Agregado
            montoIVA: totalMontoIVA,     // 👈 Agregado
            subtotal: subtotalNeto
        };

        this.nuevoMovimiento.items.push(nuevoItem);

        // No te olvides de recalcular los totales generales del movimiento después de pushear
        this.calcularTotales();

        // Limpieza de campos de carga
        this.productoSeleccionado = null;
        this.cantidadCarga = 1;
    }

    eliminarItem(index: number) {
        this.nuevoMovimiento.items.splice(index, 1);
        this.calcularTotales();
    }

    calcularTotales() {
        let neto = 0;
        let iva = 0;

        this.nuevoMovimiento.items.forEach(item => {
            // Nos aseguramos de que cada ítem tenga sus valores al día
            item.subtotal = item.cantidad * item.precio;

            const porcentaje = parseFloat(item.alicuotaIVA) || 0;
            item.montoIVA = item.subtotal * (porcentaje / 100);

            // Acumulamos para los totales generales
            neto += item.subtotal;
            iva += item.montoIVA;
        });

        // Guardamos los tres resultados en el objeto que va a la base de datos
        this.nuevoMovimiento.subtotalNeto = neto;
        this.nuevoMovimiento.totalIVA = iva;
        this.nuevoMovimiento.totalFinal = neto + iva;
    }

    // --- OTROS MÉTODOS ---
    nuevaEntidad(): void {
        this.router.navigate(['/entidades'], {
            queryParams: {
                abrirNuevo: 'true',
                volverMovimientos: 'true',
                tipo: this.tipo
            }
        });
    }

    abrirModalNuevoProducto() {
        console.log('Abriendo formulario de nuevo producto...');
    }

    abrirModalNuevoProductoDesdeBusqueda(): void {
        if (this.modalBusquedaInstance) {
            this.modalBusquedaInstance.hide();
        }

        this.router.navigate(['/productos'], {
            queryParams: {
                abrirNuevo: 'true',
                volverMovimientos: 'true'
            }
        });
    }

    // --- PERSISTENCIA ---

    guardarMovimiento() {
        // 1. Validaciones previas
        if (!this.nuevoMovimiento.datosEntidad || !this.nuevoMovimiento.datosEntidad.idEntidad) {
            Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: `Por favor, seleccione un ${this.tipo === 'VENTA' ? 'Cliente' : 'Proveedor'}.`,
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        if (!this.nuevoMovimiento.items || this.nuevoMovimiento.items.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Detalle vacío',
                text: 'No se puede confirmar la operación sin productos en el detalle.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        const esVenta = this.tipo === 'VENTA';
        const tituloFactura = esVenta ? 'Factura de Venta' : 'Factura de Compra';

        // 2. VENTANA DE CONFIRMACIÓN PREVIA
        Swal.fire({
            title: '¿Confirma la operación?',
            text: `Se registrará la ${tituloFactura} N° ${this.nuevoMovimiento.nroComprobante || ''}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {

            // 3. SI PRESIONA "SÍ", SE PROCESA EL GUARDADO
            if (result.isConfirmed) {

                // Ajuste de fecha y cuenta corriente
                if (this.fechaActual) {
                    const horaActual = new Date();
                    const [anio, mes, dia] = this.fechaActual.split('-');
                    this.nuevoMovimiento.fechaAlta = new Date(+anio, +mes - 1, +dia, horaActual.getHours(), horaActual.getMinutes());
                } else {
                    this.nuevoMovimiento.fechaAlta = new Date();
                }

                this.nuevoMovimiento.esCuentaCorriente = (this.nuevoMovimiento.formaDePago === 'CTACORRIENTE');

                // Envío al servicio HTTP
                this.movimientosService.crearMovimiento(this.nuevoMovimiento).subscribe({
                    next: (res) => {
                        console.log('Movimiento registrado con éxito:', res);

                        // Cartel de aviso: Factura cargada
                        Swal.fire({
                            icon: 'success',
                            title: `${tituloFactura} cargada`,
                            text: 'El comprobante ha sido grabado con éxito.',
                            confirmButtonText: 'Aceptar',
                            confirmButtonColor: '#28a745'
                        }).then(() => {
                            // Limpia el formulario y hace el focus tras presionar "Aceptar"
                            this.resetearFormulario();
                        });
                    },
                    error: (err) => {
                        console.error('Error al guardar el movimiento:', err);

                        if (err.error && err.error.error && err.error.error.errors) {
                            console.log('🔍 CAMPOS EXACTOS QUE FALLAN:');
                            Object.keys(err.error.error.errors).forEach(key => {
                                console.log(`-> Campo [${key}]:`, err.error.error.errors[key].message);
                            });
                        }

                        Swal.fire({
                            icon: 'error',
                            title: 'Error al guardar',
                            text: 'Hubo un problema al procesar la operación. Revisá la consola para más detalles.',
                            confirmButtonColor: '#d33'
                        });
                    }
                });
            }
        });
    }
    /**
     * Devuelve el estado inicial al formulario para una nueva carga limpia
     */
    //   @ViewChild('inputNroComprobante') inputNroComprobante!: ElementRef<HTMLInputElement>;

    resetearFormulario() {
        // 1. Limpiamos el objeto principal
        this.nuevoMovimiento = {
            tipoOperacion: this.tipo || 'COMPRA',
            tipoEntidad: this.tipo === 'VENTA' ? 'Cliente' : 'Proveedor',
            tipoComprobante: 'FACTURA',
            nroComprobante: '',
            datosEntidad: {
                idEntidad: '',
                nombreRazonSocial: '',
                tipoDocumento: 'DNI',
                documentoNumero: '',
                condicionIVA: 'Consumidor Final',
                domicilio: {}
            },
            items: [],
            subtotalNeto: 0,
            totalIVA: 0,
            totalFinal: 0,
            formaDePago: 'CONTADO',
            esCuentaCorriente: false,
            observaciones: ''
        };

        // 2. Si tenés variables de búsqueda auxiliares en tu TS, inicializalas acá también

        // 3. Devolvemos el cursor al input de N° Comprobante
        setTimeout(() => {
            if (this.inputNroComprobante && this.inputNroComprobante.nativeElement) {
                this.inputNroComprobante.nativeElement.focus();
            }
        }, 150);
    }
}