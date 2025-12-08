// src/app/chat/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { supabase } from '../../../supabase.client';
import { environment } from '../../../../environments/environment';
export type ChatMessageDto = {
  id: string;
  conversation_id: string;
  body: string;
  is_me: boolean;
  created_at: string;
  image_url?: string;
  sender_name?: string | null;

  sender?: {
    id: string;
    display_name: string;
    email?: string;
    avatar_url?: string;
  };
};


export type ConversationDto = {
  id: string;
  organization_id: string;
  type: 'dm' | 'group';
  group_id: string | null;

  participant?: {
    profile_id: string;
    display_name: string;
    name: string;
    apellido_paterno: string;
    apellido_materno: string;
    
  };

  group?: {
    id: string;
    name: string;
  };
  last_message: string;
  last_from_me: boolean;
  last_date: string;
};


@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = `${environment.apiUrl}`;

  messages = signal<ChatMessageDto[]>([]);

  constructor(private http: HttpClient) {}

  getConversationsByOrganization(organizationId: string) {
    return this.http.get<ConversationDto[]>(`${this.api}/conversations`, {
      params: { organization_id: organizationId },
    });
  }

  startConversation(participants: (string)[]): Observable<ConversationDto> {
    return this.http.post<ConversationDto>(`${this.api}/conversations/dm`, {
      participants,
    });
  }


  startGroupConversation(groupId: string | number): Observable<ConversationDto> {
    return this.http.post<ConversationDto>(`${this.api}/conversations/group`, {
      group_id: groupId,
    });
  }


  loadMessages(conversationId: string): Observable<{ data: ChatMessageDto[] }> {
    return this.http
      .get<{ data: ChatMessageDto[] }>(
        `${this.api}/conversations/${conversationId}/messages`
      )
      .pipe(
        tap((res) => {
          this.messages.set(res.data ?? []);
        })
      );
  }

sendMessage(
  conversationId: string,
  body: string,
  imageUrl?: string,
): Observable<ChatMessageDto> {
  const url = `${this.api}/conversations/${conversationId}/messages`;

  if (imageUrl) {
    const form = new FormData();
    form.append('body', body);
    form.append('image_url', imageUrl);

    return this.http.post<ChatMessageDto>(url, form).pipe(
      tap((msg) => {
        this.messages.update((arr) => [...arr, msg]);
      })
    );
  }

  return this.http.post<ChatMessageDto>(url, { body }).pipe(
    tap((msg) => {
      this.messages.update((arr) => [...arr, msg]);
    })
  );
}






async uploadChatImage(
  conversationId: string,
  profileId: string,      // si lo tienes
  blob: Blob
): Promise<string> {
  const fileExt = 'jpg';
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `chat/${conversationId}/${profileId}/${fileName}`;

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    });

  if (error) {
    console.error('Error subiendo a Supabase', error);
    throw error;
  }

  const { data } = supabase.storage
    .from('chat-images')
    .getPublicUrl(filePath);

  return data.publicUrl; // 👈 URL pública lista para usar
}

}