import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActivatedRoute } from '@angular/router';
import { ChatHeader } from '../chat-header/chat-header';
import { ChatService, ChatMessageDto } from '../../../services/chat/chat-service';

import {
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonAvatar
} from '@ionic/angular/standalone';

type ChatMsg = {
  id: string;
  text: string;
  me: boolean;
  time: string;
  avatar?: string;
  image?: string;
};

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule, IonToolbar,
    IonButton, IonIcon, IonContent, IonFooter, IonItem, IonInput, 
    IonAvatar,
    ChatHeader,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
   private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);

  conversationId = this.route.snapshot.paramMap.get('id');

  draft = '';

  defaultAvatar = 'https://i.pravatar.cc/80?img=13';
  myAvatar = 'https://i.pravatar.cc/80?img=5';

  messages = computed<ChatMsg[]>(() =>
    this.chatService.messages().map((m: ChatMessageDto) => ({
      id: m.id,
      text: m.body,
      me: m.is_me,
      time: this.formatTime(m.created_at),
      avatar: m.is_me ? this.myAvatar : this.defaultAvatar
    }))
  );

  ngOnInit() {
    if (this.conversationId) {
      this.chatService.loadMessages(this.conversationId);
    }
  }

  trackById = (_: number, m: ChatMsg) => m.id;

  send() {
    const text = this.draft?.trim();
    if (!text) return;
    if (!this.conversationId) return;

    this.chatService.sendMessage(this.conversationId, text);
    
    this.draft = '';
  }

  private formatTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  async openCameraWeb() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Podrías mostrar el stream en <video> si quieres
      console.log(stream);
    } catch (err) {
      console.error('No se pudo acceder a la cámara', err);
    }
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    const photo = image.dataUrl;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    // Esto todavía es local, si quieres enviarlo al backend habría que extender el API
    (this as any).messages.update((arr: ChatMsg[]) => [
      ...arr,
      {
        id: crypto.randomUUID(),
        text: '',
        me: true,
        time: `${hh}:${mm}`,
        image: photo
      }
    ]);
  }
 onOrgChange(orgId: string) {

  }
}
