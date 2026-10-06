import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { HeaderSistemaComponent } from '../../header/header-sistema.component';
import { EntidadesService, Entidad } from '../../services/entidades.service';
import { CuentaCorrienteService, CuentaCorriente, DatosPago } from '../../services/cuentacorriente.service';



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
    modo: 'TODOS' | 'PROVEEDORES' | 'CLIENTES' = 'TODOS';
    saldoTotalProveedor: number = 0;
    nuevaEntidad: Entidad = this.getEntidadVacia();

    filtroMovimientos: 'todos' | 'pendientes' | 'canceladas' = 'todos';

    movimientosFiltrados: any[] = [];

    mostrarModalCuentaCorriente = false;
    proveedorSeleccionado: Entidad | null = null;
    movimientosProveedor: any[] = [];
    movSeleccionadoPago: any = null;



    //  Definición actualizada en Entidades.component.ts
    nuevoPago = {
        tipoComprobante: 'RECIBO',
        nroComprobante: '',
        monto: 0,
        formaDePago: 'EFECTIVO',
        fechaPago: new Date().toISOString().substring(0, 10)
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private entidadesService: EntidadesService,
        private cuentaCorrienteService: CuentaCorrienteService
    ) { }
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            console.log('--- PARÁMETROS RECIBIDOS ---', params);
            console.log('VALOR DE tipo:', params['tipo']);
            console.log('VALOR DE abrirNuevo:', params['abrirNuevo']);

            const tipo = params['tipo'];

            if (tipo === 'proveedor') {
                this.modo = 'PROVEEDORES';
            } else if (tipo === 'cliente') {
                this.modo = 'CLIENTES';
            } else {
                this.modo = 'TODOS';
            }

            console.log('MODO ESTABLECIDO:', this.modo);

            this.cargarEntidades();

            if (params['abrirNuevo'] === 'true') {
                setTimeout(() => {
                    this.abrirModal();
                }, 0);
            }
        });
    }

    verCuentaCorriente(entidad: Entidad) {
        if (!entidad._id) return;

        this.proveedorSeleccionado = entidad;
        this.mostrarModalCuentaCorriente = true;

        this.cargarCuentaCorrienteProveedor(entidad._id);
    }



    cargarCuentaCorrienteProveedor(idEntidad: string) {
        this.cuentaCorrienteService.getCuentasCorrientes({
            idEntidad: idEntidad,
            tipoEntidad: 'Proveedor',
            tipoOperacion: 'COMPRA'
        }).subscribe({
            next: (data: any[]) => {
                this.movimientosProveedor = data.map(mov => ({
                    ...mov,
                    montoTotal: mov.montoTotal ?? mov.totalFinal ?? 0,
                    montoPago: mov.montoPago ?? mov.datosPago?.monto ?? 0
                }));

                // ✅ Aplicamos el filtro actual sobre los nuevos datos recibidos
                this.filtrarMovimientos(this.filtroMovimientos);
            },
            error: (err) => console.error('Error cargando movimientos de la CC:', err)
        });

        this.cuentaCorrienteService.getSaldoPorEntidad(idEntidad)
            .subscribe({
                next: (res) => {
                    if (res.ok && res.data) {
                        this.saldoTotalProveedor = res.data.totalAdeudado;
                    }
                },
                error: (err) => console.error('Error cargando saldo:', err)
            });
    }

    cerrarModalCuentaCorriente() {
        this.mostrarModalCuentaCorriente = false;
        this.proveedorSeleccionado = null;
        this.movimientosProveedor = [];
        this.saldoTotalProveedor = 0;
    }
    /*
        cargarMovimientosMock(idEntidad?: string) {
            const movimientosDePrueba = [
                {
                    datosEntidad: { idEntidad: "698a5549450276a2547e3fc6" },
                    tipoEntidad: "Proveedor",
                    nroComprobante: "0001-00000001",
                    montoTotal: 121000,
                    montoPago: 21000
                },
                {
                    datosEntidad: { idEntidad: "698a5549450276a2547e3fc6" },
                    tipoEntidad: "Proveedor",
                    nroComprobante: "0001-00000002",
                    montoTotal: 379000,
                    montoPago: 0
                }
            ];
    
            this.movimientosProveedor = movimientosDePrueba.filter(
                m => m.tipoEntidad === 'Proveedor'
            );
        }
    */
    cargarEntidades() {
        if (this.modo === 'PROVEEDORES') {
            this.entidadesService.getProveedores()
                .subscribe(data => this.entidades = data);
        } else if (this.modo === 'CLIENTES') {
            // Cuando tengas el servicio de clientes:
            // this.entidadesService.getClientes().subscribe(data => this.entidades = data);
        } else {
            this.entidadesService.getEntidades()
                .subscribe(data => this.entidades = data);
        }
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




    filtrarMovimientos(filtro: 'todos' | 'pendientes' | 'canceladas'): void {

        this.filtroMovimientos = filtro;

        if (filtro === 'todos') {
            this.movimientosFiltrados = [...this.movimientosProveedor];
            return;
        }

        if (filtro === 'pendientes') {
            this.movimientosFiltrados = this.movimientosProveedor.filter(
                mov => (mov.montoTotal - mov.montoPago) !== 0
            );
            return;
        }

        if (filtro === 'canceladas') {
            this.movimientosFiltrados = this.movimientosProveedor.filter(
                mov => (mov.montoTotal - mov.montoPago) === 0
            );
        }
    }
    guardarEntidad(form: NgForm) {
        if (form.invalid) {
            form.control.markAllAsTouched();
            return;
        }

        if (this.esEdicion && this.nuevaEntidad._id) {
            this.entidadesService
                .crearEntidad(this.nuevaEntidad)
                .subscribe({
                    next: (respuesta) => {
                        const entidadCreada = respuesta.data || respuesta;

                        this.cerrarModal();

                        this.router.navigate(['/movimientos'], {
                            queryParams: {
                                entidadCreadaId: entidadCreada._id,
                                tipo: this.modo === 'PROVEEDORES' ? 'COMPRA' : 'VENTA'
                            }
                        });
                    },
                    error: (err) => console.error('Error al crear:', err)
                });

        } else {
            this.entidadesService
                .crearEntidad(this.nuevaEntidad)
                .subscribe({
                    next: (respuesta) => {

                        const entidadCreada = respuesta.data || respuesta;

                        this.cerrarModal();

                        this.router.navigate(['/movimientos'], {
                            queryParams: {
                                entidadCreada: entidadCreada._id
                            }
                        });
                    },
                    error: (err) => console.error('Error al crear:', err)
                });
        }
    }

    eliminarEntidad(id: string) {
        this.entidadesService
            .eliminarEntidad(id)
            .subscribe(() => this.cargarEntidades());
    }

    // Despliega u oculta el formulario inline al hacer clic en "Pagar"
    toggleFormularioPago(mov: any) {
        if (this.movSeleccionadoPago?._id === mov._id) {
            this.cancelarPago();
        } else {
            this.movSeleccionadoPago = mov;
            const saldoPendiente = mov.montoTotal - mov.montoPago;
            this.nuevoPago = {
                tipoComprobante: 'RECIBO',
                nroComprobante: '',
                monto: saldoPendiente > 0 ? saldoPendiente : 0,
                formaDePago: 'EFECTIVO',
                fechaPago: new Date().toISOString().substring(0, 10)
            };
        }
    }

    // Resetea la selección y oculta el formulario inline
    cancelarPago() {
        this.movSeleccionadoPago = null;
        this.nuevoPago = {
            tipoComprobante: 'RECIBO',
            nroComprobante: '',
            monto: 0,
            formaDePago: 'EFECTIVO',
            fechaPago: new Date().toISOString().substring(0, 10)
        };
    }

    guardarPago(mov: CuentaCorriente, form: NgForm) {
        if (form.invalid || !mov._id) return;

        // Adaptamos el objeto al tipo DatosPago aceptado por tu servicio
        const payloadDatosPago: DatosPago = {
            tipoComprobante: this.nuevoPago.tipoComprobante,
            nroComprobante: this.nuevoPago.nroComprobante,
            monto: Number(this.nuevoPago.monto),
            formaDePago: this.nuevoPago.formaDePago,
            fechaPago: this.nuevoPago.fechaPago
        };

        // Consumimos la ruta PUT /:id/cancelar de tu router
        this.cuentaCorrienteService.cancelarCuentaCorriente(mov._id, payloadDatosPago).subscribe({
            next: (res) => {
                this.cancelarPago(); // Cierra la fila desplegable del formulario

                // Recargamos grilla y saldo para obtener los datos actualizados desde la BD
                if (this.proveedorSeleccionado?._id) {
                    this.cargarCuentaCorrienteProveedor(this.proveedorSeleccionado._id);
                }
            },
            error: (err) => console.error('Error al registrar el pago en backend:', err)
        });
    }



    volver() {
        history.back();
    }
}