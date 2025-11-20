import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  chatbubblesOutline,
  searchOutline,
  ellipsisVertical,
  chevronBackOutline,
  happyOutline,
  attachOutline,
  micOutline,
  send,
   cameraOutline,     
  imageOutline ,
  timeOutline
} from 'ionicons/icons';
import { App } from './app/app';
addIcons({
  'briefcase-outline': briefcaseOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'search-outline': searchOutline,
  'ellipsis-vertical': ellipsisVertical,
  'chevron-back-outline': chevronBackOutline,
  'happy-outline': happyOutline,
  'attach-outline': attachOutline,
  'mic-outline': micOutline,
  'send': send,
  'time-outline': timeOutline,
  'camera-outline': cameraOutline,
  'image-outline': imageOutline
});

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/ngsw-worker.js').then((registration: ServiceWorkerRegistration) => {
//       console.log('service Worker registrado con exito:', registration);
//     }).catch((error: unknown) => {
//       console.error('error en el registro del servicio worker:', error);
//     });
//   })
// }

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideIonicAngular(),
    ...(appConfig.providers ?? []),
  ],
}).catch((err: unknown) =>
  console.error('error al inicializar la aplicación:', err)
);