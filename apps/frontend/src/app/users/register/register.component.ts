import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    standalone: true,      // ⚡ clave para Angular 20 standalone
    imports: [FormsModule], // ⚡ necesario para ngForm y ngModel
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    username: string = '';
    legajo: string = '';
    password: string = '';
    errorMessage: string = '';

    onRegister() {
        if (this.username && this.legajo && this.password) {
            console.log('Usuario registrado:', this.username, this.legajo);
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Todos los campos son obligatorios.';
            console.log(this.errorMessage);
        }
    }
}
