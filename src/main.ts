import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ngsw-worker.js').then((registration: ServiceWorkerRegistration) => {
      console.log('service Worker registrado con exito:', registration);
    }).catch((error: unknown) => {
      console.error('error en el registro del servicio worker:', error);
    });
  })
}

bootstrapApplication(App, appConfig)
  .catch((err: unknown) => console.error('erro al inicializar la aplicacion:' , err));