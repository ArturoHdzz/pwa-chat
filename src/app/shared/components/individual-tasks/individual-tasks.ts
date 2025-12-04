import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasksService, CreateIndividualTaskRequest } from '../../services/tasks/tasks-service';
import { Task } from '../../models/task.model';
import { HttpClient } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Spiner } from '../movil/spiner/spiner';

@Component({
  selector: 'app-individual-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Spiner],
  templateUrl: './individual-tasks.html'
})
export class IndividualTasks implements OnInit {
  private tasksService = inject(TasksService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  tasks = signal<Task[]>([]);
  availableUsers = signal<any[]>([]);
  selectedUsers = signal<string[]>([]);
  isLoading = signal(false);
  isSyncing = signal(false); 
  showForm = signal(false);

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    due_date: ['', Validators.required]
  });

  ngOnInit() {
    this.loadTasks();
    this.loadAvailableUsers();
  }

  loadTasks() {
    const cacheKey = 'individual_tasks_cache';
    
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        this.tasks.set(JSON.parse(cachedData));
        this.isLoading.set(false);
        this.isSyncing.set(true);
      } catch (e) { console.error(e); }
    } else {
      this.isLoading.set(true);
    }

    this.tasksService.getIndividualTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
        this.isSyncing.set(false);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      },
      error: (err) => {
        console.error('Error cargando tareas individuales:', err);
        this.isLoading.set(false);
        this.isSyncing.set(false);
      }
    });
  }

  loadAvailableUsers() {
    const cacheKey = 'org_users_cache';
    const cached = localStorage.getItem(cacheKey);
    if (cached) this.availableUsers.set(JSON.parse(cached));

    this.http.get<any[]>(`${environment.apiUrl}/organizations`).subscribe({
      next: (orgs) => {
        if (orgs.length > 0) {
          this.http.get<any>(`${environment.apiUrl}/organizations/${orgs[0].id}`).subscribe({
            next: (data) => {
              const users = data.users || [];
              this.availableUsers.set(users);
              localStorage.setItem(cacheKey, JSON.stringify(users));
            },
            error: (err) => console.error('Error cargando usuarios:', err)
          });
        }
      },
      error: (err) => console.error('Error cargando organizaciones:', err)
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.taskForm.reset();
      this.selectedUsers.set([]);
    }
  }

  toggleUserSelection(userId: string) {
    this.selectedUsers.update(current => {
      if (current.includes(userId)) {
        return current.filter(id => id !== userId);
      } else {
        return [...current, userId];
      }
    });
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers().includes(userId);
  }

  onSubmit() {
    if (this.taskForm.valid && this.selectedUsers().length > 0) {
      this.isLoading.set(true);
      
      const taskData: CreateIndividualTaskRequest = {
        title: this.taskForm.value.title!,
        description: this.taskForm.value.description || '',
        due_date: this.taskForm.value.due_date!,
        assignee_ids: this.selectedUsers()
      };

      this.tasksService.createIndividualTask(taskData).subscribe({
        next: (res) => {
          this.loadTasks();
          this.toggleForm();
          this.isLoading.set(false);
          alert('Tarea individual creada y asignada correctamente.');
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          alert(err.error?.message || 'Error al crear la tarea');
        }
      });
    } else if (this.selectedUsers().length === 0) {
      alert('Debes seleccionar al menos un usuario.');
    }
  }

  deleteTask(taskId: string) {
    if(confirm('¿Eliminar esta tarea individual?')) {
      this.tasksService.deleteIndividualTask(taskId).subscribe({
        next: () => this.loadTasks(),
        error: (err) => {
          console.error(err);
          alert('Error al eliminar la tarea');
        }
      });
    }
  }
}
