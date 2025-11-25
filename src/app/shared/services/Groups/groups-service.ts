import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Group, CreateGroupRequest } from '../../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/groups`;

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(data: CreateGroupRequest): Observable<{ message: string, group: Group }> {
    return this.http.post<{ message: string, group: Group }>(this.apiUrl, data);
  }

  updateGroup(id: string, data: Partial<CreateGroupRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getGroupMembers(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/members`);
  }

  getAvailableUsers(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/available-users`);
  }

  addMember(groupId: string, profileId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/members`, { profile_id: profileId });
  }

  removeMember(groupId: string, profileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/members/${profileId}`);
  }

  joinGroup(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, { code });
  }
}
