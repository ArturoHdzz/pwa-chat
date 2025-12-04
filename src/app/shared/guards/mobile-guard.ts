import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DeviceService } from '../services/chat/device-service';
export const mobileGuard: CanActivateFn = (route, state) => {
const device = inject(DeviceService);
  const router = inject(Router);

  // Si NO es móvil, lo mandamos al layout normal
  if (!device.isMobile()) {
    return router.parseUrl('/home'); // o lo que quieras como pantalla principal de desktop
  }

  return true;
};
