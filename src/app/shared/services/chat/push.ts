// src/app/services/chat/push.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

@Injectable({ providedIn: 'root' })
export class Push {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private firebaseApp = initializeApp(environment.firebase);
  private messagingPromise = isSupported().then((supported) =>
    supported ? getMessaging(this.firebaseApp) : null
  );

  async requestPermissionAndSubscribe() {
    // Nativo (Capacitor app)
    if (Capacitor.isNativePlatform()) {
      await this.setupNativePush();
      return;
    }

    // Web / PWA
    console.log('[Push] Web: usando Firebase Cloud Messaging');

    const messaging = await this.messagingPromise;
    if (!messaging) {
      console.warn('[Push] FCM no soportado en este navegador');
      return;
    }

    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);

    if (permission !== 'granted') {
      console.warn('[Push] Permiso de notificaciones denegado');
      return;
    }

    try {
      // 👉 MUY IMPORTANTE: usar el service worker YA REGISTRADO (custom-sw.js)
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: environment.firebaseVapidKey,
        serviceWorkerRegistration: registration, // 👈 aquí la magia
      });

      if (!token) {
        console.warn('[Push] No se pudo obtener token FCM web');
        return;
      }

      console.log('[Push] FCM Web token:', token);

      this.sendTokenToBackend(token, 'web');

      onMessage(messaging, (payload) => {
        console.log('[Push] Mensaje FCM en foreground', payload);
      });
    } catch (err) {
      console.error('[Push] Error obteniendo token FCM web', err);
    }
  }

  private async setupNativePush() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Permiso de notificaciones denegado (nativo)');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
      this.sendTokenToBackend(token.value, Capacitor.getPlatform());
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida en foreground', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Acción de notificación', notification);
      const data = notification.notification.data;
      // navegar con data.conversation_id si quieres
    });
  }

  private sendTokenToBackend(token: string, platform: string) {
    this.http
      .post(`${this.api}/push/mobile-token`, {
        token,
        platform, // 'web' | 'android' | 'ios'
      })
      .subscribe({
        next: () => console.log('Token push registrado correctamente', platform),
        error: (err) => console.error('Error registrando token push', err),
      });
  }
}
