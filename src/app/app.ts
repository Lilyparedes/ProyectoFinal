import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  isLoggedIn = false;
  isVIP = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkSession();
  }

  userName: string | null = null;



   checkSession() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  this.isLoggedIn = !!user;
  this.isVIP = JSON.parse(localStorage.getItem('isVIP') || 'false');
  this.userName = user?.name || null;
   }

  logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('isVIP');
  localStorage.removeItem('selectedSeat');
  localStorage.removeItem('token');

  this.isLoggedIn = false;
  this.isVIP = false;
  this.userName = null;

  alert(" Sesión cerrada correctamente");
  this.router.navigate(['/login']);
  }


}
