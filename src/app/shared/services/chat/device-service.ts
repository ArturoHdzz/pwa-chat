import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  isMobile(): boolean {
    if (typeof window === 'undefined') return false;

    const width = window.innerWidth;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

    const isMobileUA =
      /android/i.test(ua) ||
      /iPad|iPhone|iPod/.test(ua) ||
      /Windows Phone/i.test(ua);

      console.log('[DeviceService] UA:', ua);
    console.log('[DeviceService] isMobile:', isMobileUA);


    return width <= 900 || isMobileUA;
  }
}
