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
  timeOutline,
  notificationsOutline,
  peopleOutline,
  calendarOutline,
  ellipsisHorizontal,
  funnelOutline,
  mailUnreadOutline,
  atOutline,
  personCircleOutline,
  addOutline,
  
  createOutline
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
  'image-outline': imageOutline,
  'ellipsis-horizontal': ellipsisHorizontal,
  'funnel-outline': funnelOutline,
  'mail-unread-outline': mailUnreadOutline,
  'at-outline': atOutline,
  'notifications-outline': notificationsOutline,
  'people-outline': peopleOutline,
  'calendar-outline': calendarOutline,
  'create-outline': createOutline,
  'person-circle-outline': personCircleOutline,
  'add-outline': addOutline,
});


bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideIonicAngular(),
    ...(appConfig.providers ?? []),
  ],
}).catch((err: unknown) =>
  console.error('error al inicializar la aplicación:', err)
);