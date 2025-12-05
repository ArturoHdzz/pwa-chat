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
    if (Capacitor.isNativePlatform()) {
      await this.setupNativePush();
      return;
    }

    // WEB / PWA
    console.log('[Push] Web: usando Firebase Cloud Messaging');
    // ... tu lógica actual de web push (ya la tienes) ...
  }

  private async setupNativePush() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Permiso de notificaciones denegado');
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

    // 👇 Cuando la app está en foreground y llega una notificación nativa
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notificación nativa recibida', notification);

      const title =
        (notification.notification && notification.notification.title) ||
        (notification as any).title ||
        'Nuevo mensaje';

      const body =
        (notification.notification && notification.notification.body) ||
        (notification as any).body ||
        '';

      const data = notification.data || {};

      // Disparamos un evento global para que Angular lo capture
      window.dispatchEvent(
        new CustomEvent('app-push-message', {
          detail: {
            title,
            body,
            data,
          },
        })
      );
    });

    // Opcional: cuando el user toca la notificación (background → abrir chat)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Acción de notificación', notification);
      const data = notification.notification.data;
      // Aquí puedes navegar a la conversación en app nativa, si lo deseas
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

  // ... tu urlBase64ToUint8Array y resto de código web push ...
}
