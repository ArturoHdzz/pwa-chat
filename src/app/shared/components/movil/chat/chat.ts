import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActivatedRoute } from '@angular/router';
import { ChatHeader } from '../chat-header/chat-header';
import { ChatService, ChatMessageDto } from '../../../services/chat/chat-service';
import { Spiner } from '../spiner/spiner';
import {UserProfile} from '../../../models/profile.model'
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
  user?: UserProfile;

  defaultAvatar = 'https://i.pravatar.cc/80?img=13';
  myAvatar = 'https://i.pravatar.cc/80?img=5';

  messages = computed<ChatMsg[]>(() =>
    this.chatService.messages().map((m: ChatMessageDto) => {
      const mapped: ChatMsg = {
        id: m.id,
        text: m.body,
        me: m.is_me,
        time: this.formatTime(m.created_at),
        avatar: m.is_me ? this.myAvatar : this.defaultAvatar,
        image: m.image_url || undefined,
      };

      // 👈 LOG por cada mensaje mapeado
      console.log('[Chat] mapped message', {
        api: m,
        mapped,
      });

      return mapped;
    })
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
        console.log('messages', this.messages)
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
  console.log('enviando foto');

  if (!this.conversationId) {
    this.showError('No se encontró la conversación.');
    return;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    if (!image.webPath) {
      this.showError('No se pudo obtener la imagen de la cámara.');
      return;
    }

    const response = await fetch(image.webPath);
    const blob = await response.blob();

    console.log('Tamaño blob MB:', (blob.size / (1024 * 1024)).toFixed(2));

    const userJson = localStorage.getItem('user');
    this.user = userJson ? JSON.parse(userJson) : undefined;

    const imageUrl = await this.chatService.uploadChatImage(
      this.conversationId,
      this.user?.profile?.id || '',
      blob
    );

    console.log('Imagen subida a Supabase:', imageUrl);

    this.chatService
      .sendMessage(this.conversationId, '', imageUrl)
      .subscribe({
        next: () => {
          // ya se agrega al store en el tap del servicio
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


onFileSelected = async (event: Event) => {
  if (!this.conversationId) {
    this.showError('No se encontró la conversación.');
    return;
  }

  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  try {
    const userJson = localStorage.getItem('user');
    this.user = userJson ? JSON.parse(userJson) : undefined;

    const imageUrl = await this.chatService.uploadChatImage(
      this.conversationId,
      this.user?.profile?.id || '',
      file   // File también es un Blob, no hay problema
    );

    console.log('Imagen subida a Supabase desde file input:', imageUrl);

    // 2) Enviar mensaje con la URL
    this.chatService
      .sendMessage(this.conversationId, this.draft || '', imageUrl)
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
  } catch (err) {
    console.error('Error subiendo la imagen a Supabase', err);
    this.showError('No se pudo subir la imagen. Intenta de nuevo.');
  }
};



}
