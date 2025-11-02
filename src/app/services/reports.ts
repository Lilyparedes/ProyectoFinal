import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = 'http://localhost:3000/api/reports';

  constructor(private http: HttpClient) {}

  getStats(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats?userId=${userId}`);
  }
  
  //peticion asincrona para obtener estadisticas globales
  getGlobalStats(): Observable<any> {
  return this.http.get(`${this.apiUrl}/global`);
}

  // Este es el método  para importar el XML
  importXML(formData: FormData): Observable<any> {
    return this.http.post(`http://localhost:3000/api/reservations/import/xml`, formData);}

}
