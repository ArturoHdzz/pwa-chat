import { Component } from '@angular/core';
import { ChatHeader } from '../chat-header/chat-header';
import {OnInit, signal, inject } from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
} from '@ionic/angular/standalone';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonButtons,
  IonText,
} from '@ionic/angular/standalone';

import { Task } from '../../../models/task.model';
import { TasksService } from '../../../services/tasks/tasks-service';
import { Spiner } from '../spiner/spiner';
import { IonButton } from '@ionic/angular/standalone';
@Component({
  selector: 'app-tasks',
  imports: [ChatHeader,
    CommonModule,
    NgFor,
    IonContent,
    Spiner,
    DatePipe,
    IonButton,
    IonIcon,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonButtons,
    IonText,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks {
private tasksService = inject(TasksService);
  isLoading = signal(true);
  selectedFileName = signal<string | null>(null);
  loadmessage = signal('Cargando tareas...');
  tasks = signal<Task[]>([]);

  activeTaskId = signal<string | null>(null);
  submissionText = signal<string>('');
  selectedFile = signal<File | null>(null);
  isActionLoading = signal(false);


  onOrgChange(orgId: string) {
  }
   ngOnInit() {
    this.tasksService.getMyTasks().subscribe({
      next: (res) => {
        this.tasks.set(res);
        this.loadmessage.set('Cargando tareas...');
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
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-700';
      case 'rejected':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    
    }
  }



  markInProgress(task: Task) {
    this.isLoading.set(true);
    this.loadmessage.set('Cambiando el estado')

    if (task.my_status === 'in_progress') return;

    this.isActionLoading.set(true);

    this.tasksService.setInProgress(task.id).subscribe({
      next: () => {
        this.tasks.update((list) =>
          list.map((t) =>
            t.id === task.id ? { ...t, my_status: 'in_progress' } : t
          )
        );
        this.isActionLoading.set(false);
        this.isLoading.set(false);
        console.log('Estado cambiado a in_progress');
      },
      error: (err) => {
        console.error('Error cambiando estado a in_progress', err);
        this.isActionLoading.set(false);
      },
    });
  }

  /** Abre el formulario de entrega para una tarea */
  openSubmitForm(task: Task) {
    this.activeTaskId.set(task.id);
    this.submissionText.set('');
    this.selectedFile.set(null);
  }

  /** Maneja el cambio de archivo */
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (file) {
      this.selectedFileName.set(file.name); 
      this.selectedFile.set(file);
    } else {
      this.selectedFile.set(null);
      this.selectedFileName.set(null);
    }
  }
  clearFile() {
  this.selectedFileName.set(null);
  this.selectedFile.set(null);
}


  submitCurrentTask() {
    this.isLoading.set(true);
    this.loadmessage.set('Enviando tarea')
    const taskId = this.activeTaskId();
    if (!taskId) return;

    const text = this.submissionText().trim();
    const file = this.selectedFile();

    if (!text && !file) {
      alert('Debes escribir algo o adjuntar un archivo para enviar la tarea.');
      return;
    }

    this.isActionLoading.set(true);

    this.tasksService
      .submitTask(taskId, {
        submission_text: text || undefined,
        file: file || null,
      })
      .subscribe({
        next: () => {
          // actualizamos estado local
          this.tasks.update((list) =>
            list.map((t) =>
              t.id === taskId ? { ...t, my_status: 'submitted' } : t
            )
          );
          this.isActionLoading.set(false);
          this.activeTaskId.set(null);
          this.submissionText.set('');
          this.selectedFile.set(null);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error enviando tarea', err);
          this.isActionLoading.set(false);
        },
      });
  }

  cancelSubmitForm() {
    this.activeTaskId.set(null);
    this.submissionText.set('');
    this.selectedFile.set(null);
  }
}
