import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SeatsService {

  private API = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSeats() {
    return this.http.get(`${this.API}/seats`);
  }

  reserveSeat(data: any) {
    return this.http.post(`${this.API}/reservations`, data);
  }


  sendTicketEmail(data: any) {
  return this.http.post('http://localhost:3000/api/email/sendTicket', data);
}


  modifyReservation(data: any) {
    return this.http.put(`${this.API}/reservations/modify`, data);
  }

cancelByCUIAndSeat(data: any) {
  return this.http.put('http://localhost:3000/api/reservations/cancel', data);
}

getReservationStats(userId: number) {
  return this.http.get(`http://localhost:3000/api/reports/stats?userId=${userId}`);
}

downloadReservationsXML() {
  return this.http.get('http://localhost:3000/api/reservations/export/xml', {
    responseType: 'blob'  // 👈 importante
  });
}



}
