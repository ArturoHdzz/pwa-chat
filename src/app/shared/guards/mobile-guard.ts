import { CanActivateFn,CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DeviceService } from '../services/chat/device-service';
export const mobileGuard: CanMatchFn = (route, segments) => {
const device = inject(DeviceService);
  const router = inject(Router);

 const isMobile = device.isMobile();
  console.log('[mobileGuard canMatch] isMobile:', isMobile);

  if (!isMobile) {
    return router.parseUrl('/home');
  }

  return true;
};
