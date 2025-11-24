
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type OrganizationDto = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
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
}
