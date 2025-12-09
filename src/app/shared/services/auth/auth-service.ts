import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
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
      id: string;
      display_name: string;
      role: 'jefe' | 'profesor' | 'Alumno' | 'User'; 
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
  role: 'jefe' | 'profesor';
  organization_name?: string;
  organization_code?: string;
  turnstile_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    if (typeof window !== 'undefined' && localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.userSubject.next(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }

  login(email: string, password: string, turnstileToken: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/login`,
      { email, password,
        turnstile_token: turnstileToken,
       }
    );
  }

  verify2fa(userId: number, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/login/verify`,
      { user_id: userId, code }
    ).pipe(
      tap(response => {
        this.guardarToken(response.token, response.user);
        this.userSubject.next(response.user); 
      })
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/register`,
      userData
    ).pipe(
      tap(response => {
        this.guardarToken(response.token, response.user);
        this.userSubject.next(response.user); 
      })
    );
  }

  guardarToken(token: string, user?: any) {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user); 
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
      localStorage.removeItem('organizations');
 localStorage.removeItem('selectedOrganizationId');

    }
    this.userSubject.next(null); 
  }

  auth(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/me`).pipe(
      tap(user => {
        if (typeof window !== 'undefined' && localStorage) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.userSubject.next(user); 
      })
    );
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

  getCurrentUser(): any {
    return this.userSubject.value;
  }
}
