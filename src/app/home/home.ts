import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReportsService } from '../services/reports';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  totalUsers = 0;
  totalReservationsGlobal = 0;
  isVIP = false;
  userName = '';

  constructor(
    private reportsService: ReportsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || !user.id) {
  this.router.navigate(['/login']);
  return;
}


    this.userName = user.name;
    this.loadStats(user.id);
    this.loadGlobalStats();
  }

  /**  Estadísticas del usuario (para VIP) */
  loadStats(userId: string): void {
    this.reportsService.getStats(userId).subscribe({
      next: (stats) => {
        console.log("📊 Stats usuario:", stats);
        const total = stats.total ?? 0;
        this.isVIP = stats.total >= 5;

        if (this.isVIP) {
          console.log("👑 Usuario VIP detectado");
          localStorage.setItem("isVIP", "true");
        }
      },
      error: (err) => console.error("❌ Error al cargar stats", err)
    });
  }

  /**  Estadísticas globales */
  loadGlobalStats(): void {
    this.reportsService.getGlobalStats().subscribe({
      next: (stats) => {
        console.log("🌍 Stats globales:", stats);
        this.totalUsers = stats.totalUsers;
        this.totalReservationsGlobal = stats.totalReservations;
      },
      error: (err) => console.error("❌ Error global stats:", err)
    });
  }

}
