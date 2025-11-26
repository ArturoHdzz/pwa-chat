// src/app/chat/chat-list.ts
import {
  Component,
  signal,
  inject,
} from '@angular/core';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonAvatar,
  IonLabel,

  IonList,

} from '@ionic/angular/standalone';
import { ChatService } from '../../../services/chat/chat-service';
import { ActivatedRoute } from '@angular/router';
import { ChatHeader } from '../chat-header/chat-header';
import { Organizations, OrganizationDto, userOrganizationDto } from '../../../services/organizations/organizations';
const ORG_STORAGE_KEY = 'selectedOrganizationId';

@Component({
  selector: 'app-users-list',
  imports: [
  ChatHeader,
  IonContent,
  IonList,
  IonItem,
  CommonModule,
NgFor,
  IonLabel,
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList {
  data?: userOrganizationDto;
  private orgService = inject(Organizations);
  currentOrgId = this.orgService.selectedOrgId;
  private chatService = inject(ChatService);
  private router = inject(Router);
  filter = signal<'recent' | 'unread' | 'mentions' | 'conversations'>('recent');

  organizations = signal<OrganizationDto[]>([]);
  selectedOrganizationId = signal<string | null>(null);
  selectedUserIds = signal<( string)[]>([]);
  selectedGroupId = signal<number | string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orgs: Organizations
  ) {}

  ngOnInit() {
     const orgId = this.route.snapshot.paramMap.get('orgId')!;
    this.onOrgChange(orgId);
  }


  onOrgChange(orgId: string) {
     this.orgs.getuserOrganization(orgId).subscribe(res => {
      this.data = res;
      console.log('DATA:', res);
    });
  }



  toggleUser(user: any) {
    const current = this.selectedUserIds();
    const id = user.profile_id;

    // si selecciono un usuario, quito cualquier grupo seleccionado
    this.selectedGroupId.set(null);

    if (current.includes(id)) {
      this.selectedUserIds.set(current.filter((x) => x !== id));

    } else {
      this.selectedUserIds.set([...current, id]);
    }
  }

  isUserSelected(user: any): boolean {
    return this.selectedUserIds().includes(user.profile_id);
  }

  toggleGroup(group: any) {
    const current = this.selectedGroupId();
    const id = group.id;

    // al seleccionar grupo, limpiamos usuarios
    this.selectedUserIds.set([]);

    if (current === id) {
      this.selectedGroupId.set(null);
    } else {
      this.selectedGroupId.set(id);
    }
  }

  isGroupSelected(group: any): boolean {
    return this.selectedGroupId() === group.id;
  }

  hasSelection(): boolean {
    return (
      this.selectedUserIds().length > 0 || this.selectedGroupId() !== null
    );
  }

  // ---------- crear conversación y redirigir ----------

  startConversation() {
    const groupId = this.selectedGroupId();
    const users = this.selectedUserIds();

    // 1) Grupo
    if (groupId) {
      this.chatService.startGroupConversation(groupId).subscribe({
        next: (conv) => {
          this.router.navigate(['/m/chat', conv.id]);
        },
        error: (err) => {
          console.error('Error al crear conversación de grupo', err);
        },
      });
      return;
    }

    // 2) DM o multi
    if (users.length === 0) return;

    console.log('Creating conversation with users:', users);
    this.chatService.startConversation(users).subscribe({
      next: (conv) => {
        this.router.navigate(['/m/chat', conv.id]);
      },
      error: (err) => {
        console.error('Error al crear conversación', err);
      },
    });
  

  }
}
