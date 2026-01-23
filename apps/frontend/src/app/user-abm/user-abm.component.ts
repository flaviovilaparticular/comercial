import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.services';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
//import { ComunesComponent } from '../comunes/comunes.component';

const Swal = require('sweetalert2');

@Component({
    selector: 'app-user-abm',
    standalone: true,
    imports: [CommonModule, FormsModule, HeaderComponent],
    templateUrl: './user-abm.component.html',
    styleUrls: ['./user-abm.component.css']
})
export class UserAbmComponent implements OnInit {
    usuarios: any[] = [];
    usuarioSeleccionado: any = null;
    mostrarModal = false;
    esEdicion = false;

    nuevoUsuario = {
        dni: '',
        password: '',
        legajo: '',
        nombre: '',
        rol: '',
        idefector: '',
        idservicio: '',
        email: ''
    };

    constructor(private userService: UserService, private router: Router) { }

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.userService.getUsers().subscribe({
            next: (data) => this.usuarios = data,
            error: (err) => console.error('Error al obtener usuarios', err)
        });
    }

    abrirModal(usuario?: any): void {
        if (usuario) {
            this.esEdicion = true;
            this.usuarioSeleccionado = { ...usuario };
            this.nuevoUsuario = { ...usuario, password: '' };
        } else {
            this.esEdicion = false;
            this.nuevoUsuario = {
                dni: '', password: '', legajo: '', nombre: '',
                rol: '', idefector: '', idservicio: '', email: ''
            };
            this.usuarioSeleccionado = null;
        }
        this.mostrarModal = true;
    }

    cerrarModal(): void {
        this.mostrarModal = false;
    }

    guardarUsuario(): void {
        if (this.esEdicion && this.usuarioSeleccionado) {
            this.userService.updateUser(this.usuarioSeleccionado._id, this.nuevoUsuario).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Usuario actualizado correctamente', 'success');
                    this.cargarUsuarios();
                    this.cerrarModal();
                },
                error: () => Swal.fire('❌ Error', 'No se pudo actualizar el usuario', 'error')
            });
        } else {
            this.userService.register(this.nuevoUsuario).subscribe({
                next: () => {
                    Swal.fire('✅ Éxito', 'Usuario creado correctamente', 'success');
                    this.cargarUsuarios();
                    this.cerrarModal();
                },
                error: (err) => {
                    Swal.fire('❌ Error', 'No se pudo crear el usuario', 'error');
                    console.error(err);
                }
            });
        }
    }

    eliminarUsuario(id: string): void {
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.userService.deleteUser(id).subscribe({
                    next: () => {
                        Swal.fire('🗑️ Eliminado', 'Usuario eliminado correctamente', 'success');
                        this.cargarUsuarios();
                    },
                    error: () => Swal.fire('❌ Error', 'No se pudo eliminar el usuario', 'error')
                });
            }
        });
    }

    volver(): void {
        this.router.navigate(['/menu']);
    }

}
