// src/app/chat/chat-list.ts
import {
  Component,
  signal,

  inject,

} from '@angular/core';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonItem,
  IonAvatar,
  IonLabel,

  IonList,

} from '@ionic/angular/standalone';

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
  filter = signal<'recent' | 'unread' | 'mentions' | 'conversations'>('recent');

  organizations = signal<OrganizationDto[]>([]);
  selectedOrganizationId = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orgs: Organizations
  ) {}

  ngOnInit() {
     const orgId = this.route.snapshot.paramMap.get('orgId')!;
    this.orgs.getuserOrganization(orgId).subscribe(res => {
      this.data = res;
      console.log('DATA:', res);
    });
  
  }

selectOrganization(orgId: string) {
  this.setSelectedOrganization(orgId);
}

private setSelectedOrganization(orgId: string) {
  this.selectedOrganizationId.set(orgId);
  localStorage.setItem(ORG_STORAGE_KEY, orgId);
  this.orgService.setSelected(orgId);   

}

}
