import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
    activo: boolean;
    profile?: {
      organization: {
        id: string;
        name: string;
      }
    }
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  password: string;
  organization_name: string;
  role: 'jefe' | 'profesor';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/login`,
      { email, password }
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/register`,
      userData
    );
  }

  guardarToken(token: string, user?: any) {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }

  logout() {
    const token = this.getToken();
    if (token) {
      return this.http.post(`${environment.apiUrl}/logout`, {}).pipe(
        tap(() => {
          this.clearAuth();
          this.router.navigate(['/login']);
        })
      );
    }
    this.clearAuth();
    this.router.navigate(['/login']);
    return new Observable();
  }

  private clearAuth() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  auth(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/me`);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
