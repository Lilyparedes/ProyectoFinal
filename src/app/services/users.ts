import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private API_URL = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(this.API_URL, data);
  }

  login(data: any) {
    return this.http.post(`${this.API_URL}/login`, data);
  }
}
