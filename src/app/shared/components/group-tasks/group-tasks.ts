import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasksService } from '../../services/tasks/tasks-service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-group-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './group-tasks.html'
})
export class GroupTasks implements OnInit {
  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);
  private fb = inject(FormBuilder);

  groupId: string = '';
  tasks = signal<Task[]>([]);
  isLoading = signal(false);
  showForm = signal(false);

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    due_date: ['', Validators.required]
  });

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadTasks();
    }
  }

  loadTasks() {
    this.isLoading.set(true);
    this.tasksService.getTasks(this.groupId).subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) this.taskForm.reset();
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading.set(true);
      this.tasksService.createTask(this.groupId, this.taskForm.value as any).subscribe({
        next: (res) => {
          this.loadTasks(); 
          this.toggleForm();
          alert('Tarea asignada a todos los miembros correctamente.');
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          alert('Error al crear la tarea');
        }
      });
    }
  }

  deleteTask(taskId: string) {
    if(confirm('¿Eliminar esta tarea? Se borrará para todos los alumnos.')) {
      this.tasksService.deleteTask(this.groupId, taskId).subscribe({
        next: () => this.loadTasks()
      });
    }
  }
}
