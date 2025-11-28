import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActivatedRoute } from '@angular/router';
import { ChatHeader } from '../chat-header/chat-header';
import { ChatService, ChatMessageDto } from '../../../services/chat/chat-service';
import { Spiner } from '../spiner/spiner';
import { Push } from '../../../services/chat/push';
import {
  IonToolbar,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonAlert,
  IonModal,
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
    Spiner,
    IonButton, IonIcon, IonContent, IonFooter, IonItem, IonInput, 
    IonAvatar,
    IonAlert,
    ChatHeader,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
   private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  errorOpen = signal(false);
    errorMessage = signal<string | null>(null);
  conversationId = this.route.snapshot.paramMap.get('id');
isLoading = signal(true);
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
constructor(private pushService: Push) {}
 ngOnInit() {
   if ('Notification' in window && 'serviceWorker' in navigator) {
    this.pushService.requestPermissionAndSubscribe();
  }
   if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event: any) => {
      if (event.data?.type === 'NEW_MESSAGE') {
        const convId = event.data.conversation_id;
        if (convId === this.conversationId) {
          this.chatService.loadMessages(convId).subscribe();
        }
      }
    });
  }
  if (this.conversationId) {
    this.chatService.loadMessages(this.conversationId).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar mensajes', err.error.error);
        this.showError( err.error.error ? err.error.error : 'No se pudieron cargar los mensajes. Intenta de nuevo más tarde.');
      }
    });
  }
}


  trackById = (_: number, m: ChatMsg) => m.id;

  showError(msg: string) {
    this.errorMessage.set(msg);
    this.errorOpen.set(true);
  }
  send() {
  const text = this.draft?.trim();
  if (!text) return;

  if (!this.conversationId) {
    this.showError('No se encontró la conversación.');
    return;
  }

  this.chatService.sendMessage(this.conversationId, text).subscribe({
    next: () => {  this.draft = '';
    },
    error: (err) => {
      console.error('Error al enviar el mensaje', err);
      this.showError( err.error.error ? err.error.error : 'Error al enviar el mensaje.');
    }
  });
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
  
  closeError() {
    this.errorOpen.set(false);
    this.errorMessage.set(null);
  }
}
