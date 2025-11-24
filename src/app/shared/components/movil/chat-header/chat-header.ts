import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonModal,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { User } from '../../../models/user.model';
import { OrganizationDto } from '../../../services/organizations/organizations';

@Component({
  selector: 'app-chat-header',
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonModal,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.css'
})
export class ChatHeader {
@Input() title = 'Chat';
  @Input() timeLabel = '11:15';

  @Input() organizations: OrganizationDto[] = [];
  @Input() selectedOrgId: string | null = null;

  @Output() organizationChange = new EventEmitter<string>();

  user: User = JSON.parse(localStorage.getItem('user') || '{}');

  userName = this.user.name + ' ' + this.user.apellido_paterno + ' ' + this.user.apellido_materno;
  
  userEmail = this.user.email;
  

  isModalOpen = signal(false);

  get selectedOrgName(): string {
    const org = this.organizations?.find((o) => o.id === this.selectedOrgId);
    return org?.name ?? '';
  }

  openProfile() {
    this.isModalOpen.set(true);
  }

  closeProfile() {
    this.isModalOpen.set(false);
  }

  onOrgSelect(orgId: string) {
    this.organizationChange.emit(orgId);
  }

}
