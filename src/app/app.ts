import { Component, signal, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    IonApp, 
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.html',
  styles: [`
    .update-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      left: 20px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    }
    @media(min-width: 768px) {
      .update-toast { left: auto; width: 400px; }
    }
    @keyframes slideIn {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class App implements OnInit {
  protected readonly title = signal('pwa');
  protected updateAvailable = signal(false);
  private swUpdate = inject(SwUpdate);

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          console.log('Nueva versión descargada y lista.');
          this.updateAvailable.set(true);
        });

      interval(60 * 60 * 1000).subscribe(() => {
        this.checkForUpdates();
      });
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'visible' && this.swUpdate.isEnabled) {
      console.log('App visible, verificando actualizaciones...');
      this.checkForUpdates();
    }
  }

  private async checkForUpdates() {
    try {
      await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Error al verificar actualizaciones:', err);
    }
  }

  reloadPage() {
    window.location.reload();
  }

  closeUpdateBanner() {
    this.updateAvailable.set(false);
  }
}
