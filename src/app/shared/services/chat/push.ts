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
    // Si es app nativa → usar PushNotifications
    if (Capacitor.isNativePlatform()) {
      await this.setupNativePush();
    } else {
      // Aquí puedes dejar tu lógica de web push (service worker, VAPID)
      // o simplemente no hacer nada en web si no quieres duplicar
      console.log('Web push manejado por service worker (ya lo tienes configurado).');
    }
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

    // Opcional: manejar cuando llega una notificación en foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida en foreground', notification);
      // Puedes mostrar un toast, badge, etc.
    });

    // Opcional: cuando el user toca la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Acción de notificación', notification);
      const data = notification.notification.data;
      // Ej: navegar a la conversación
      // data.conversation_id
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
}

