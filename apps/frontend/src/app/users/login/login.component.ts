import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ necesario para *ngIf
import { Router } from '@angular/router';
import { UserService } from '../../services/user.services';
import { HomeComponent } from '../../home/home.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, HomeComponent], // ✅ agregamos CommonModule
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    dni: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(private userService: UserService, private router: Router) { }

    onLogin() {
        if (this.dni && this.password) {
            this.userService.login(this.dni, this.password).subscribe({
                next: (response) => {
                    if (response?.token) {
                        localStorage.setItem('token', response.token);
                        if (response.user) localStorage.setItem('user', JSON.stringify(response.user));
                        this.router.navigate(['/home']);
                    } else {
                        this.errorMessage = 'DNI o contraseña incorrectos.';
                    }
                },
                error: () => (this.errorMessage = 'DNI o contraseña inexistente.')
            });
        } else {
            this.errorMessage = 'Todos los campos son obligatorios.';
        }
    }
}
