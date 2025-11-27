import { Component } from '@angular/core';
import { ChatHeader } from '../chat-header/chat-header';
import {OnInit, signal, inject } from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import {
  IonContent,
} from '@ionic/angular/standalone';
import { Task } from '../../../models/task.model';
import { TasksService } from '../../../services/tasks/tasks-service';
import { Spiner } from '../spiner/spiner';
@Component({
  selector: 'app-tasks',
  imports: [ChatHeader,
    CommonModule,
    NgFor,
    IonContent,
    Spiner,
    DatePipe,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks {
private tasksService = inject(TasksService);
  isLoading = signal(true);
  tasks = signal<Task[]>([]);

  onOrgChange(orgId: string) {
  }
   ngOnInit() {
    this.tasksService.getMyTasks().subscribe({
      next: (res) => {
        this.tasks.set(res);
        this.isLoading.set(false);
      },
      error: (err) => console.error('Error cargando tareas', err),
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'graded':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
