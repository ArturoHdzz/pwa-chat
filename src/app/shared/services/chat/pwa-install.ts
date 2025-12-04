import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaInstall {
   deferredPrompt: any = null;
  canInstall = signal(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();   // evita que Chrome muestre su banner automático
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      console.log('PWA instalada');
    }

    this.deferredPrompt = null;
    this.canInstall.set(false);
  }
}
