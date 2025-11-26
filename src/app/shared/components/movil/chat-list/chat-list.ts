// src/app/chat/chat-list.ts
import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ChatHeader } from '../chat-header/chat-header';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonList,
  IonIcon,
  IonFabButton,
  IonFab
} from '@ionic/angular/standalone';

import { ChatService, ConversationDto } from '../../../services/chat/chat-service';
import { Organizations, OrganizationDto } from '../../../services/organizations/organizations';

type Conversation = {
  id: string;
  name: string;
  display_name: string;
  initials: string;
  avatar?: string;
  lastMessage: string;
  lastFromMe?: boolean;
  lastDateLabel: string;
  unread?: number;
};

const ORG_STORAGE_KEY = 'selectedOrganizationId';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonItem,
    IonIcon,
    IonAvatar,
    IonFabButton,
    IonLabel,
    IonBadge,
    IonList,
    IonFab,
    ChatHeader,
  ],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css',
})
export class ChatList implements OnInit {
  private router = inject(Router);
  private chatService = inject(ChatService);
  private orgService = inject(Organizations);
  currentOrgId = this.orgService.selectedOrgId;
  filter = signal<'recent' | 'unread' | 'mentions' | 'conversations'>('recent');

  organizations = signal<OrganizationDto[]>([]);
  selectedOrganizationId = signal<string | null>(null);

  conversations = signal<Conversation[]>([]);

  filteredConversations = computed(() => {
    const list = this.conversations();
    if (this.filter() === 'unread') {
      return list.filter((c) => (c.unread ?? 0) > 0);
    }
    return list;
  });

  ngOnInit() {
    
  }


  onOrgChange(orgId: string) {
    this.loadConversations(orgId);
  }



  private loadConversations(orgId: string) {
    this.chatService.getConversationsByOrganization(orgId).subscribe({
      next: (convs) => {
        const mapped = convs.map((c) => this.mapConversationDto(c));
        this.conversations.set(mapped);
        console.log('Conversaciones cargadas:', mapped);
      },
      error: (err) => {
        console.error('Error al cargar conversaciones', err);
      },
    });
  }

  private mapConversationDto(dto: ConversationDto): Conversation {
    // nombre de la conversación:
    // - si es dm → usamos participant.display_name o su nombre+apellidos
    // - si es group → dto.group.name
    let name = '';
    let display_name = '';
    if (dto.type === 'dm' && dto.participant) {
      const p = dto.participant;
      name =
        [p.name, p.apellido_paterno, p.apellido_materno]
          .filter(Boolean)
          .join(' ');

     display_name = dto.participant.display_name;
    } else if (dto.type === 'group' && dto.group) {
      name = dto.group.name;
    } else {
      name = 'Chat sin nombre';
    }
    const lastMessage = dto.last_message;
    const lastFromMe = dto.last_from_me;
    const lastDateLabel = dto.last_date;
    const initials = this.getInitials(name);

    return {
      id: dto.id,
      name,
      initials,
      display_name,
      lastMessage,
      lastFromMe,
      lastDateLabel,
      unread: 0,
    };
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  setFilter(value: 'recent' | 'unread' | 'mentions' | 'conversations') {
    this.filter.set(value);
  }

  openChat(conv: Conversation) {
    this.router.navigate(['/m/chat', conv.id]);
  }

  newChat() {
    const orgId = this.orgService.selectedOrgId();
    this.router.navigate(['/m/users',orgId]);
  }
}
