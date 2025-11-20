import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  let headers = req.headers;

  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token');
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(req.body instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
  }

   const clonedRequest = req.clone({ headers });
   return next(clonedRequest);
};
