import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Task, CreateTaskRequest } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/groups`;

  getTasks(groupId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${groupId}/tasks`);
  }

  createTask(groupId: string, task: CreateTaskRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/tasks`, task);
  }

  deleteTask(groupId: string, taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/tasks/${taskId}`);
  }
}
