// src/app/chat/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export type ChatMessageDto = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  is_me: boolean;
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


  loadMessages(conversationId: string) {
    this.http
       .get<{ data: ChatMessageDto[] }>(`${this.api}/conversations/${conversationId}/messages`)
        .subscribe(res => {
        this.messages.set(res.data ?? []);
      });
  }

  sendMessage(conversationId: string, body: string) {
    return this.http
      .post<ChatMessageDto>(`${this.api}/conversations/${conversationId}/messages`, { body })
      .subscribe(msg => {
        this.messages.update(arr => [...arr, msg]);
      });
  }

}
