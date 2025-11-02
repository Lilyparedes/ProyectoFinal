import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SeatsService } from '../services/seats';
import { ReportsService } from '../services/reports';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

interface Seat {
  id: string;
  seat_number: string;
  is_available: boolean;
  class_name: string;
}


@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './seats.html',
  styleUrls: ['./seats.css']
})

export class SeatsComponent {

  businessSeats: Seat[] = [];
  economySeats: Seat[] = [];

  businessRows = ['I', 'G', 'F', 'D', 'C', 'A'];
  businessCols = [1, 2];

  economyRows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  economyCols = [3, 4, 5, 6, 7];

  showModal: boolean = false;
  selectedSeat: Seat | null = null;

  totalReservations = 0;
  randomReservations = 0;
  modifiedReservations = 0;
  canceledReservations = 0;
  manualReservations = 0;

  
  importResult = { cargados: 0, errores: 0, tiempo: '' };



  constructor(
    private seatsService: SeatsService,
    private reportsService: ReportsService,
    private router: Router
  ) {}

  

  ngOnInit() {
    this.loadSeats();
    this.loadUserReservationStats();
  }

 loadSeats() {
  this.seatsService.getSeats().subscribe(
    (res: any) => {
      this.businessSeats = res.filter((s: Seat) => s.class_name === 'Business');
      this.economySeats = res.filter((s: Seat) => s.class_name === 'Economy');
    },
    () => alert('Error al cargar asientos ❌')
  );
}


getSeat(code: string): Seat | undefined {
  return (
    this.businessSeats.find((s: Seat) => s.seat_number === code) ||
    this.economySeats.find((s: Seat) => s.seat_number === code)
  );
}

  selectSeat(seat: Seat | undefined) {
    if (!seat) return;
    this.selectedSeat = seat;
    this.showModal = true;
  }

  goToReserve() {
    if (!this.selectedSeat) return;

    localStorage.setItem('selectedSeat', JSON.stringify(this.selectedSeat));
    this.closeModal();
    this.router.navigate(['/reserve']);
  }

  closeModal() {
    this.showModal = false;
  }

  loadUserReservationStats() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  this.reportsService.getStats(user.id).subscribe({
    next: stats => {
      console.log("📊 Stats usuario:", stats);

      this.totalReservations = stats.total;          // reservas únicas (grupos)
      this.randomReservations = stats.random;        // asientos aleatorios
      this.manualReservations = stats.manual;        // asientos manuales
      this.modifiedReservations = stats.modified;    // asientos modificados
      this.canceledReservations = stats.canceled;    // asientos cancelados
    },
    error: (err) => console.error("❌ Error cargando estadísticas", err)
  });
}


  get businessOccupied() {
    return this.businessSeats.filter(s => !s.is_available).length;
  }
  get businessFree() {
    return this.businessSeats.filter(s => s.is_available).length;
  }
  get economyOccupied() {
    return this.economySeats.filter(s => !s.is_available).length;
  }
  get economyFree() {
    return this.economySeats.filter(s => s.is_available).length;
  }

  downloadXML() {
  this.seatsService.downloadReservationsXML().subscribe((file) => {
    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = "reservas.xml";
    link.click();
    window.URL.revokeObjectURL(url);
  });
}


  uploadXML(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.reportsService.importXML(formData).subscribe({
      next: (res: any) => {
        this.importResult = {
          cargados: res.cargados || 0,
          errores: res.errores || 0,
          tiempo: res.tiempo || '0 ms'
        };

        // 🪄 Mostrar modal de Bootstrap
        const modalEl = document.getElementById('resultModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }

        this.loadSeats(); // recargar los asientos
      },
      error: () => {
        alert('❌ Error al cargar el archivo XML.');
      }
    });
  }



}
