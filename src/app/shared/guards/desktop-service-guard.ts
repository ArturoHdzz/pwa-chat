import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DeviceService } from '../services/chat/device-service';
export const desktopServiceGuard: CanActivateFn = (route, state) => {
  const device = inject(DeviceService);
  const router = inject(Router);

  // Si es móvil, lo mandamos a /m
  if (device.isMobile()) {
    return router.parseUrl('/m/chat');
  }
  console.log('es movile',device.isMobile())

  return true;
};
