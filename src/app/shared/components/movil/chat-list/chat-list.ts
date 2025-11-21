// src/app/chat/chat-list.ts
import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonList,
  IonChip,
  IonSelect,
  IonSelectOption,
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonList,
    IonChip,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css',
})
export class ChatList implements OnInit {
  private router = inject(Router);
  private chatService = inject(ChatService);
  private orgService = inject(Organizations);

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
    this.loadOrganizations();
  }

  private loadOrganizations() {
    const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);

    this.orgService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations.set(orgs);
        console.log('Organizaciones cargadas:', orgs);
        localStorage.setItem('organizations', JSON.stringify(orgs));

        if (orgs.length === 0) {
          // Sin organizaciones, nada que cargar
          return;
        }

        // Si hay una guardada en localStorage y existe en la lista
        const existingStored = orgs.find((o) => o.id === storedOrgId);

        if (existingStored) {
          this.setSelectedOrganization(existingStored.id);
          return;
        }

        // Si solo hay una, usamos esa directamente
        if (orgs.length === 1) {
          this.setSelectedOrganization(orgs[0].id);
          return;
        }

        // Si hay varias, esperamos a que el usuario elija en el select
        // (selectedOrganizationId se quedará null hasta que elijan)
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
      },
    });
  }

onOrgChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const orgId = select.value;
  console.log('Org seleccionada:', orgId);
  this.selectOrganization(orgId);
}

selectOrganization(orgId: string) {
  this.setSelectedOrganization(orgId);
}

private setSelectedOrganization(orgId: string) {
  this.selectedOrganizationId.set(orgId);
  localStorage.setItem(ORG_STORAGE_KEY, orgId);
  this.loadConversations(orgId);
}



  // 3) cargar conversaciones para la organización seleccionada
  private loadConversations(orgId: string) {
    this.chatService.getConversationsByOrganization(orgId).subscribe({
      next: (convs) => {
        const mapped = convs.map((c) => this.mapConversationDto(c));
        this.conversations.set(mapped);
      },
      error: (err) => {
        console.error('Error al cargar conversaciones', err);
      },
    });
  }

  // Mapear lo que manda el backend a lo que usa el chat-list
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

    const initials = this.getInitials(name);

    return {
      id: dto.id,
      name,
      initials,
      display_name,
      lastMessage: '',
      lastFromMe: false,
      lastDateLabel: '',
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
    console.log('Nuevo chat');
  }
}
