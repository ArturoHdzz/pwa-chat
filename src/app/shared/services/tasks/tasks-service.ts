import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Task, CreateTaskRequest } from '../../models/task.model';

export interface CreateIndividualTaskRequest {
  title: string;
  description?: string;
  due_date: string;
  assignee_ids: string[];
}
interface TaskAssigneeResponse {
  message: string;
  task_assignee: {
    task_id: string;
    user_id: string;
    status: string;
    submission_content: string | null;
    grade: number | null;
    feedback: string | null;
    submitted_at: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getTasks(groupId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/groups/${groupId}/tasks`);
  }

  createTask(groupId: string, task: CreateTaskRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/tasks`, task);
  }

  deleteTask(groupId: string, taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${groupId}/tasks/${taskId}`);
  }

  getTaskDetails(groupId: string, taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${groupId}/tasks/${taskId}`);
  }

  gradeTask(groupId: string, taskId: string, userId: string, grade: number, feedback: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/tasks/${taskId}/grade`, {
      user_id: userId,
      grade,
      feedback
    });
  }

  getIndividualTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/individual`);
  }

  createIndividualTask(task: CreateIndividualTaskRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/individual`, task);
  }

  getIndividualTaskDetails(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/individual/${taskId}`);
  }

  gradeIndividualTask(taskId: string, userId: string, grade: number, feedback: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/individual/${taskId}/grade`, {
      user_id: userId,
      grade,
      feedback
    });
  }

  deleteIndividualTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/individual/${taskId}`);
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`);
  }

  setInProgress(taskId: string): Observable<TaskAssigneeResponse> {
    return this.http.patch<TaskAssigneeResponse>(
      `${this.apiUrl}/tasks/${taskId}/status`,
      { status: 'in_progress' }
    );
  }

  /** Entregar tarea (texto y/o archivo) */
  submitTask(
    taskId: string,
    payload: { submission_text?: string; file?: File | null }
  ): Observable<TaskAssigneeResponse> {
    const formData = new FormData();

    if (payload.submission_text) {
      formData.append('submission_text', payload.submission_text);
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    return this.http.post<TaskAssigneeResponse>(
      `${this.apiUrl}/tasks/${taskId}/submit`,
      formData
    );
  }
}
