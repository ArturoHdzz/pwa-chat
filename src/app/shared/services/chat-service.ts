// src/app/chat/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export type ChatMessageDto = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = `${environment.apiUrl}`;

  messages = signal<ChatMessageDto[]>([]);

  constructor(private http: HttpClient) {}

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
