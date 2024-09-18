
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9090/api/auth';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}
  

  signup(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/signup`, { username, password });
  }

  signin(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/signin`, { username, password })
      .subscribe(response => {
        localStorage.setItem('token', response.token);
        this.tokenSubject.next(response.token);
      });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }
}
