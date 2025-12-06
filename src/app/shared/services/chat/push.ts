// src/app/services/chat/push.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Push {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  async requestPermissionAndSubscribe() {
    // Sólo Web/PWA con Web Push:
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Push] Este navegador no soporta Web Push');
      return;
    }

    const permission = await Notification.requestPermission();
    console.log('[Push] permission:', permission);
    if (permission !== 'granted') {
      console.warn('[Push] Notificaciones denegadas');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(
        environment.vapidPublicKey
      ) as BufferSource,
    });

    console.log('[Push] WebPush subscription:', subscription);

   this.http
      .post(`${this.api}/push/web-subscription`, subscription)
      .subscribe({
        next: () => console.log('[Push] Subscripción WebPush registrada'),
        error: (err) =>
          console.error('[Push] Error registrando subscripción WebPush', err),
      });
  }

  // helper
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

