import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(AuthService);
  
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return userService.auth().pipe(
    map(() => true),
    catchError(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
