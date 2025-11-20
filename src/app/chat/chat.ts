import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonFooter, IonItem, IonInput, IonAvatar
} from '@ionic/angular/standalone';

type ChatMsg = {
  id: string;
  text: string;
  me: boolean;     
  time: string;    
  avatar?: string; 
};

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonIcon, IonContent, IonFooter, IonItem, IonInput, IonAvatar
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  draft = '';
  defaultAvatar = 'https://i.pravatar.cc/80?img=13';
  myAvatar = 'https://i.pravatar.cc/80?img=5';

  messages = signal<ChatMsg[]>([
    {
      id: '1',
      text: '¡Hola! ¿En qué puedo ayudarte hoy?',
      me: false,
      time: '09:30',
      avatar: this.defaultAvatar
    },
    { id: '2', text: 'Hablemos del proyecto que tenemos.', me: true, time: '09:31' },
    { id: '3', text: 'Perfecto.', me: false, time: '09:31', avatar: this.defaultAvatar },
    { id: '4', text: '¿Cuál es el estado actual?', me: true, time: '09:32' }, 
    { id: '5', text: 'Estamos avanzando según lo planeado.', me: false, time: '09:33', avatar: this.defaultAvatar },
    { id: '6', text: '¡Excelente noticia!', me: true, time: '09:34' },
    { id: '7', text: '¿Hay algo más en lo que pueda ayudarte?', me: false, time: '09:35', avatar: this.defaultAvatar },
    { id: '8', text: 'No, eso es todo por ahora. Gracias.', me: true, time: '09:36' },
    { id: '9', text: 'De nada. ¡Que tengas un buen día!', me: false, time: '09:37', avatar: this.defaultAvatar },
    { id: '10', text: 'Igualmente, hasta luego.', me: true, time: '09:38' },
    { id: '11', text: 'Adiós.', me: false, time: '09:39', avatar: this.defaultAvatar },
    { id: '12', text: 'Recibido ✅', me: false, time: '09:40', avatar: this.defaultAvatar }
  ]);

  trackById = (_: number, m: ChatMsg) => m.id;

  send() {
    const text = this.draft?.trim();
    if (!text) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    this.messages.update(arr => [
      ...arr,
      { id: crypto.randomUUID(), text, me: true, time: `${hh}:${mm}` }
    ]);
    this.draft = '';

    // Simulación de respuesta (eliminar en producción)
    setTimeout(() => {
      const time = new Date();
      const hh2 = String(time.getHours()).padStart(2, '0');
      const mm2 = String(time.getMinutes()).padStart(2, '0');

      this.messages.update(arr => [
        ...arr,
        {
          id: crypto.randomUUID(),
          text: 'Recibido ✅',
          me: false,
          time: `${hh2}:${mm2}`,
          avatar: this.defaultAvatar
        }
      ]);
    }, 700);
  }
}
