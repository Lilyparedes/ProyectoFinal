import { Component } from '@angular/core';
import { UsersService } from '../services/users';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  name: string = '';
  email: string = '';
  password: string = '';

  constructor(private userService: UsersService, private router: Router) {}

  onRegister() {

    //  Validar campos vacíos
    if (!this.name || !this.email || !this.password) {
      return alert('❌ Todos los campos son obligatorios');
    }

    // Normalizar correo y validar dominio
    const emailLower = this.email.toLowerCase();

    if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@outlook.com')) {
      return alert('❌ Solo correos @gmail.com o @outlook.com');
    }

    this.email = emailLower; // Guardar en formato correcto

    // Validar contraseña mínima
    if (this.password.length < 6) {
      return alert('❌ La contraseña debe tener al menos 6 caracteres');
    }

    // DATA después de validar
    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.userService.register(data).subscribe({
      next: () => {
        alert('✅ Usuario registrado con éxito');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('❌ Error: ' + (err.error.message || 'No se pudo registrar'));
      }
    });
  }
}
