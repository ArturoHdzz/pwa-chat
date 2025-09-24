import { Component , signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonFooter, IonItem, IonInput
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
    CommonModule, FormsModule,
     IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
    IonContent, IonFooter, IonItem, IonInput
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
draft = '';
  defaultAvatar = 'https://i.pravatar.cc/80?img=13';
  myAvatar = 'https://i.pravatar.cc/80?img=5';

  messages = signal<ChatMsg[]>([
    { id: '1', text: '¡Hola! ¿En qué puedo ayudarte hoy?', me: false, time: '09:30', avatar: this.defaultAvatar },
    { id: '2', text: 'Quiero ver un diseño de chat con Ionic en Angular.', me: true, time: '09:31' },
    { id: '3', text: 'Perfecto, te envío un ejemplo listo para usar.', me: false, time: '09:31', avatar: this.defaultAvatar }
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

    // Simula respuesta (quita esto en producción)
    setTimeout(() => {
      this.messages.update(arr => [
        ...arr,
        { id: crypto.randomUUID(), text: 'Recibido ✅', me: false, time: `${hh}:${mm}`, avatar: this.defaultAvatar }
      ]);
    }, 700);
  }
}
