import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
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
import { OrganizationDto, Organizations } from '../../../services/organizations/organizations';

const ORG_STORAGE_KEY = 'selectedOrganizationId';

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
export class ChatHeader implements OnInit {

  @Input() title = 'Chat';
  @Input() timeLabel = '11:15';

  @Output() organizationChange = new EventEmitter<string>();

  private orgService = inject(Organizations);

  organizations = signal<OrganizationDto[]>([]);
  selectedOrgId = signal<string | null>(null);

  user: User = JSON.parse(localStorage.getItem('user') || '{}');

  userName = this.user.name + ' ' + this.user.apellido_paterno + ' ' + this.user.apellido_materno;
  userEmail = this.user.email;

  isModalOpen = signal(false);

  ngOnInit() {
    this.loadOrganizations();
  }

  private loadOrganizations() {
    const storedOrgId = localStorage.getItem(ORG_STORAGE_KEY);

    this.orgService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations.set(orgs);
        localStorage.setItem('organizations', JSON.stringify(orgs));

        if (orgs.length === 0) {
          return;
        }

        // Buscar si el storedOrgId sigue existiendo
        const existingStored = storedOrgId
          ? orgs.find(o => o.id === storedOrgId)
          : undefined;

        const orgIdToUse = existingStored?.id ?? orgs[0].id;

        // Seteamos y disparamos el cambio para que los demás componentes reaccionen
        this.setSelectedOrganization(orgIdToUse, true);
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
      }
    });
  }

  private setSelectedOrganization(orgId: string, emit: boolean) {
    this.selectedOrgId.set(orgId);
    localStorage.setItem(ORG_STORAGE_KEY, orgId);
    this.orgService.setSelected(orgId);

    if (emit) {
      this.organizationChange.emit(orgId);
    }
  }

  get selectedOrgName(): string {
    const org = this.organizations().find(o => o.id === this.selectedOrgId());
    return org?.name ?? '';
  }

  openProfile() {
    this.isModalOpen.set(true);
  }

  closeProfile() {
    this.isModalOpen.set(false);
  }

  onOrgSelect(orgId: string) {
    this.setSelectedOrganization(orgId, true);
  }

  getUserInitials(): string {
    const user = this.user;
    if (!user) return 'U';

    const firstInitial = user.name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.apellido_paterno?.charAt(0)?.toUpperCase() || '';

    return `${firstInitial}${lastInitial}` || 'U';
  }
}
