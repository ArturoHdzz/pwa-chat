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
      avatar: m.is_me ? this.myAvatar : this.defaultAvatar,
      image: m.image_url || undefined,
    }))
  );
constructor(private pushService: Push) {}
 ngOnInit() {
  this.pushService.requestPermissionAndSubscribe();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event: any) => {
      if (event.data?.type === 'NEW_MESSAGE') {
        const convId = event.data.conversation_id;
        if (convId === this.conversationId) {
          this.chatService.loadMessages(convId).subscribe();
        }
      }

      if (event.data?.type === 'PUSH_MESSAGE') {
        // aquí tu lógica de modal, como ya teníamos
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
    next: () => {  
      console.log('messages',this.messages)
      this.draft = '';
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
  if (!this.conversationId) {
    this.showError('No se encontró la conversación.');
    return;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (!image.dataUrl) {
      return;
    }

    const blob = this.dataUrlToBlob(image.dataUrl);

    this.chatService
      .sendMessage(this.conversationId, '', blob)
      .subscribe({
        next: () => {
          // No hace falta tocar this.messages, ya se actualiza en el servicio.
        },
        error: (err) => {
          console.error('Error al enviar la foto', err);
          this.showError(
            err?.error?.error || 'No se pudo enviar la foto. Intenta de nuevo.'
          );
        },
      });
  } catch (err) {
    console.error('No se pudo tomar la foto', err);
    this.showError('No se pudo acceder a la cámara.');
  }
}

 onOrgChange(orgId: string) {

  }
  
  closeError() {
    this.errorOpen.set(false);
    this.errorMessage.set(null);
  }

  private dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}


onFileSelected(event: Event) {
  if (!this.conversationId) {
    this.showError('No se encontró la conversación.');
    return;
  }

  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  this.chatService.sendMessage(this.conversationId, this.draft || '', file)
    .subscribe({
      next: () => {
        this.draft = '';
        input.value = '';
      },
      error: (err) => {
        console.error('Error al enviar la imagen', err);
        this.showError(
          err?.error?.error || 'No se pudo enviar la imagen. Intenta de nuevo.'
        );
      },
    });
}


}
