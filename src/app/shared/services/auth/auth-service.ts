import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string, user: any }>(
      `${environment.apiUrl}/login`,
      { email, password }
    );
  }

  guardarToken(token: string, user?: any) {
    localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  auth(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/me`);
  }
}
