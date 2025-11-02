import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SeatsService } from '../services/seats';

type Mode = 'manual' | 'random';

interface Seat {
  id: string;
  seat_number: string;
  is_available: boolean;
  class_name: string;
}

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './reserve.html',
  styleUrls: ['./reserve.css']
})
export class ReserveComponent {

  selectionMode: Mode = 'manual';
  cantidadBusiness = 0;
  cantidadEconomy = 0;

  businessSeats: Seat[] = [];
  economySeats: Seat[] = [];

  businessRows = ['I', 'G', 'F', 'D', 'C', 'A'];
  businessCols = [1, 2];
  economyRows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  economyCols = [3, 4, 5, 6, 7];

  selectedSeats: Seat[] = [];
  currentIndex = 0;

  showModal = false;
  showTicket = false;

  passenger: any = { passenger_name: '', cui: '', has_luggage: false };

  ticketList: any[] = [];
  ticketTotal = 0;
  ticketDate = new Date();

  isVIP: boolean = false;

  reservationGroup: string = '';



  constructor(
    private seatsService: SeatsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSeats();
    this.checkVIPStatus();

  }

  /** Cargar asientos */
  loadSeats() {
    this.seatsService.getSeats().subscribe((res) => {
  const seats = res as Seat[]; 

  this.businessSeats = seats.filter(s => s.class_name === 'Business');
  this.economySeats  = seats.filter(s => s.class_name === 'Economy');
});

  }

  /** Inicia selección */
  start() {
   this.reservationGroup = this.generateUUID();
    console.log("🆕 Nuevo grupo de reserva:", this.reservationGroup);

    const total = this.cantidadBusiness + this.cantidadEconomy;
    if (total < 1) return alert('Debes seleccionar al menos un asiento ✅');

    if (this.selectionMode === 'random') return this.assignRandom();

    alert('Selecciona tus asientos en el mapa y presiona Continuar ✅');
  }

  generateUUID(): string {
  // ✅ Genera UUID versión 4 válido para PostgreSQL
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}



  /** Selección aleatoria */
  assignRandom() {
    const pick = (seats: Seat[], qty: number) =>
      seats.filter(s => s.is_available)
           .sort(() => Math.random() - 0.5)
           .slice(0, qty);

    if (this.cantidadBusiness)
      this.selectedSeats.push(...pick(this.businessSeats, this.cantidadBusiness));
    if (this.cantidadEconomy)
      this.selectedSeats.push(...pick(this.economySeats, this.cantidadEconomy));

    this.finalizeSeatSelection();
  }

  /** Manual desde el mapa */
  clickSeat(seat: Seat | undefined) {
    if (!seat?.is_available) return;

    if (this.selectedSeats.includes(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
      return;
    }

    const countBusiness = this.selectedSeats.filter(s => s.class_name === 'Business').length;
    const countEconomy  = this.selectedSeats.filter(s => s.class_name === 'Economy').length;

    if (seat.class_name === 'Business' && countBusiness >= this.cantidadBusiness)
      return alert('Ya elegiste todos los Business');
    if (seat.class_name === 'Economy' && countEconomy >= this.cantidadEconomy)
      return alert('Ya elegiste todos los Economy');

    this.selectedSeats.push(seat);
  }

  /** Pasar a capturar datos */
  finalizeSeatSelection() {
    const total = this.cantidadBusiness + this.cantidadEconomy;
    if (this.selectedSeats.length !== total)
      return alert(`Selecciona exactamente ${total} asientos ✅`);

    this.currentIndex = 0;
    this.openModal();
  }

  openModal() {
    this.passenger = { passenger_name: '', cui: '', has_luggage: false };
    this.showModal = true;
  }

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



  /** ENVIAR ticket por correo */
 private sendEmail() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const data = {
    email: user.email,
    name: user.name || 'Pasajero',
    tickets: this.ticketList,
    total: this.ticketTotal,
    isVIP: this.isVIP 
  };

  this.seatsService.sendTicketEmail(data).subscribe({
    next: () => console.log('📩 Ticket enviado por correo!'),
    error: () => console.warn('⚠ Error enviando correo')
  });
}

checkVIPStatus() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  this.seatsService.getReservationStats(user.id).subscribe({
    next: (stats: any) => {
      this.isVIP = stats.unique_reservations >= 5;
      console.log("VIP:", this.isVIP);
    },
    error: () => console.warn("⚠ error obteniendo VIP")
  });
}


  /** Finalizar proceso */
  private finishFlow() {
    this.showModal = false;
    this.showTicket = true;
    this.ticketDate = new Date();

    this.sendEmail(); 
    localStorage.removeItem('selectedSeat');
    this.loadSeats();
  }

  confirmPassenger(form: any) {
    if (!form.valid) return alert('Completa los datos');
    if (!this.validateCUI(this.passenger.cui)) return alert('CUI inválido ❌');

    const seat = this.selectedSeats[this.currentIndex];
    const user = JSON.parse(localStorage.getItem('user')!);
    const price = seat.class_name === 'Business' ? 1550 : 750;

    this.seatsService.reserveSeat({
  user_id: user.id,
  seat_id: seat.id,
  passenger_name: this.passenger.passenger_name,
  cui: this.passenger.cui,
  has_luggage: this.passenger.has_luggage,
  price_paid: price,
  selection_type: this.selectionMode,
  reservation_group: this.reservationGroup
}).subscribe({

      next: () => {        
        // Guardar info en ticket
        this.ticketList.push({
          seat_number: seat.seat_number,
          passenger_name: this.passenger.passenger_name,
          class_name: seat.class_name,
          price_paid: price
        });
        this.ticketTotal += price;
        this.currentIndex++;

        //  Si no quiero continuar
        if (this.currentIndex < this.selectedSeats.length) {
          const seguir = confirm("✅ Pasajero registrado. ¿Deseas continuar?");
          
          if (!seguir) {
            // **NO RESERVAR** los demás
            this.selectedSeats = this.selectedSeats.slice(0, this.currentIndex);
            return this.finishFlow();
          }

          // Continuar registro siguiente pasajero
          form.reset();
          this.openModal();
          return;
        }

        // TODOS los pasajeros completados
        this.finishFlow();
      },

      error: () => alert('❌ Error al guardar pasajero')
    });
  }

  closeTicket() {
    this.showTicket = false;
    this.router.navigate(['/seats']);
  }

  getSeat(code: string) {
    return this.businessSeats.find(s => s.seat_number === code)
        || this.economySeats.find(s => s.seat_number === code);
  }

  isSelectedCode(code: string) {
    return this.selectedSeats.some(s => s.seat_number === code);
  }
}
