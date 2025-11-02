import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SeatsService } from '../services/seats';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancel.html',
  styleUrls: ['./cancel.css']
})
export class CancelComponent {

  cui: string = '';
  seatNumber: string = '';

  showSuccessModal = false;
  passengerName = '';
  refundedAmount = 0; 

  constructor(
    private seatsService: SeatsService,
    private router: Router
  ) {}

  /** Validación CUI guatemalteco */
validateCUI(cui: string): boolean {
  if (!cui) {
    console.warn("⚠️ CUI vacío");
    return false;
  }

  // Quita espacios y guiones
  cui = cui.replace(/[\s-]/g, '');

  const cuiRegExp = /^[0-9]{13}$/;
  if (!cuiRegExp.test(cui)) {
    console.warn("❌ CUI con formato inválido");
    return false;
  }

  const depto = parseInt(cui.substring(9, 11), 10);
  const muni = parseInt(cui.substring(11, 13), 10);
  const numero = cui.substring(0, 8);
  const verificador = parseInt(cui.substring(8, 9), 10);

  const munisPorDepto = [
    17, 8, 16, 16, 13, 14, 19, 8, 24, 21,
    9, 30, 32, 21, 8, 17, 14, 5, 11, 11, 7, 17
  ];

  if (depto === 0 || muni === 0) {
    console.warn("❌ CUI con código de municipio o departamento inválido.");
    return false;
  }

  if (depto > munisPorDepto.length) {
    console.warn("❌ CUI con código de departamento inválido.");
    return false;
  }

  if (muni > munisPorDepto[depto - 1]) {
    console.warn("❌ CUI con código de municipio inválido.");
    return false;
  }

  // Verificación por complemento 11
  let total = 0;
  for (let i = 0; i < numero.length; i++) {
    total += Number(numero[i]) * (i + 2);
  }

  const modulo = total % 11;
  console.log("✅ Módulo verificador:", modulo);

  return modulo === verificador;
}


  cancelReservation(form: NgForm) {
    if (!form.valid) return alert("⚠️ Completa todos los datos");
    if (!this.validateCUI(this.cui)) return alert("❌ CUI inválido");

    this.seatsService.cancelByCUIAndSeat({
      cui: this.cui,
      seatNumber: this.seatNumber
    }).subscribe({
      next: (res: any) => {
        this.passengerName = res.passenger;
        this.showSuccessModal = true;
      },
      error: err => {
        alert(err.error?.message || "❌ No se pudo cancelar la reserva");
      }
    });
  }

  closeSuccess() {
    this.showSuccessModal = false;
    this.router.navigate(['/seats']);
  }
}
