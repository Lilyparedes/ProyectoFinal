import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeatsService } from '../services/seats';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-modify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modify.html',
  styleUrls: ['./modify.css']
})
export class ModifyComponent {

  modifiedPassenger: string = ''; 
  newPrice: number = 0; 
  cui = '';
  currentSeatNumber = '';
  newSeatNumber = '';

  showSuccessModal = false;

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


  modifyReservation() {
    if (!this.validateCUI(this.cui)) {
      const errorModal = new Modal(document.getElementById('errorModal')!);
      errorModal.show();
      return;
    }

    const payload = {
      cui: this.cui,
      oldSeatNumber: this.currentSeatNumber,
      newSeatNumber: this.newSeatNumber
    };

    this.seatsService.modifyReservation(payload).subscribe({
      next: (res: any) => {
        this.modifiedPassenger = "Pasajero"; 
        this.newPrice = res.newPrice;
        this.showSuccessModal = true;
        const successModal = new Modal(document.getElementById('successModal')!);
        successModal.show();
      },
      error: err => {
        console.error(err);
        const errorModal = new Modal(document.getElementById('errorModal')!);
        errorModal.show();
      }
    });
  }

  closeSuccess() {
    this.showSuccessModal = false;
    this.router.navigate(['/seats']);
  }
}
