// src/app/services/chat/push.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class Push {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  async requestPermissionAndSubscribe() {
    console.log('entro')
    // 1) Si algún día empaquetas como app nativa:
    if (Capacitor.isNativePlatform()) {
      await this.setupNativePush();
      return;
    }

    // 2) PWA / Web → Web Push
    console.log('[Push] Web push: usando Service Worker + PushManager');

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Este navegador no soporta Web Push');
      return;
    }

    // Permiso de notificaciones
    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);

    if (permission !== 'granted') {
      console.warn('[Push] Permiso de notificaciones denegado o ignorado');
      return;
    }

    // Esperar a que el service worker esté listo
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] Service worker listo:', registration);

    // Ver si ya hay suscripción
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      console.log('[Push] Ya existe suscripción de Web Push');
      return;
    }

    // Crear nueva suscripción
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(
        environment.vapidPublicKey
      ) as Uint8Array<ArrayBuffer>,
    });

    console.log('[Push] Nueva suscripción creada:', sub);

    // Extraer claves
    const rawKey = sub.getKey('p256dh');
    const rawAuth = sub.getKey('auth');

    const publicKey = rawKey
      ? btoa(String.fromCharCode(...new Uint8Array(rawKey)))
      : '';
    const authToken = rawAuth
      ? btoa(String.fromCharCode(...new Uint8Array(rawAuth)))
      : '';

    // Mandar al backend (PushSubscriptionController@store)
    this.http
      .post(`${this.api}/push-subscriptions`, {
        endpoint: sub.endpoint,
        public_key: publicKey,
        auth_token: authToken,
        content_encoding: 'aesgcm', // o 'aes128gcm' según uses
      })
      .subscribe({
        next: () => console.log('[Push] Suscripción web push registrada en backend'),
        error: (err) =>
          console.error('[Push] Error registrando suscripción web push', err),
      });
  }

  // RAMA NATIVA (la puedes dejar para futuro)
  private async setupNativePush() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Permiso de notificaciones (nativas) denegado');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
      this.sendTokenToBackend(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación nativa en foreground', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Click en notificación nativa', notification);
    });
  }

  private sendTokenToBackend(token: string) {
    this.http
      .post(`${this.api}/push/mobile-token`, {
        token,
        platform: Capacitor.getPlatform(), // 'android' | 'ios'
      })
      .subscribe({
        next: () => console.log('Token móvil registrado correctamente'),
        error: (err) => console.error('Error registrando token móvil', err),
      });
  }

 private urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

}
