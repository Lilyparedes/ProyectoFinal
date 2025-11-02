import { Component } from '@angular/core';
import { UsersService } from '../services/users';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(
    private userService: UsersService,
    private router: Router
  ) {}

  onLogin() {
    const data = { email: this.email, password: this.password };

    this.userService.login(data).subscribe({
      next: (res: any) => {
        const successModal = new Modal(document.getElementById('successModal')!);
        successModal.show();

        localStorage.setItem('user', JSON.stringify(res.user));

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },

      error: () => {
        const errorModal = new Modal(document.getElementById('errorModal')!);
        errorModal.show();
      }
    });
  }
}
