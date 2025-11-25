
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';
export type OrganizationDto = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type userOrganizationDto = {
  organization: OrganizationDto;
  users:
  [
    User
  ],
  groups:
  [
    Group
  ]
};

@Injectable({
  providedIn: 'root'
})
export class Organizations {
  selectedOrgId = signal<string | null>(null);
  private readonly api = `${environment.apiUrl}/organizations`;
    constructor(private http: HttpClient) {}
    getOrganizations() {
        return this.http.get<OrganizationDto[]>(this.api);
    }
    setSelected(orgId: string) {
    this.selectedOrgId.set(orgId);
  }

 getuserOrganization(orgId: string) {
  return this.http.get<userOrganizationDto>(`${environment.apiUrl}/organizations/${orgId}`);
}

}
