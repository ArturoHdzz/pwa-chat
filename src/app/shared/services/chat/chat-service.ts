// src/app/chat/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
export type ChatMessageDto = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
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

  postconversation(other_profile_id: string) {
    return this.http.post<ChatMessageDto>(`${this.api}/conversations/dm`, { other_profile_id });
  }

  loadMessages(conversationId: string) {
    this.http
      .get<ChatMessageDto[]>(`${this.api}/conversations/${conversationId}/messages`)
      .subscribe(msgs => this.messages.set(msgs));
  }

  sendMessage(conversationId: string, body: string) {
    return this.http
      .post<ChatMessageDto>(`${this.api}/conversations/${conversationId}/messages`, { body })
      .subscribe(msg => {
        this.messages.update(arr => [...arr, msg]);
      });
  }

}
