import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

const VAPID_PUBLIC_KEY = 'TU_CLAVE_VAPID_PUBLICA_BASE64';


@Injectable({
  providedIn: 'root'
})
export class Push {
   private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async requestPermissionAndSubscribe() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    const body = {
      endpoint: sub.endpoint,
      public_key: this.arrayBufferToBase64(
        (sub.toJSON() as any).keys.p256dh
      ),
      auth_token: this.arrayBufferToBase64(
        (sub.toJSON() as any).keys.auth
      ),
      content_encoding: 'aesgcm',
    };

    return this.http.post(`${this.api}/push-subscriptions`, body).toPromise();
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: string): string {
    return buffer; // porque keys ya vienen como base64url; puedes adaptarlo si lo necesitas
  }
}
