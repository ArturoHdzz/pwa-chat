import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasksService } from '../../services/tasks/tasks-service';
import { GroupsService } from '../../services/Groups/groups-service';
import { Task } from '../../models/task.model';
import { Spiner } from '../movil/spiner/spiner'; 

@Component({
  selector: 'app-group-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Spiner],
  templateUrl: './group-tasks.html'
})
export class GroupTasks implements OnInit {
  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);
  private groupsService = inject(GroupsService);
  private fb = inject(FormBuilder);

  groupId: string = '';
  tasks = signal<Task[]>([]);
  groupMembers = signal<any[]>([]);
  selectedMembers = signal<string[]>([]);
  isLoading = signal(false);
  showForm = signal(false);
  
  assignmentType = signal<'all' | 'individual'>('all');

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    due_date: ['', Validators.required]
  });

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadTasks();
      this.loadGroupMembers();
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

  loadGroupMembers() {
    this.groupsService.getGroupMembers(this.groupId).subscribe({
      next: (data) => this.groupMembers.set(data),
      error: (err) => console.error('Error cargando miembros:', err)
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.taskForm.reset();
      this.selectedMembers.set([]);
      this.assignmentType.set('all');
    }
  }

  toggleMemberSelection(profileId: string) {
    this.selectedMembers.update(current => {
      if (current.includes(profileId)) {
        return current.filter(id => id !== profileId);
      } else {
        return [...current, profileId];
      }
    });
  }

  isSelectedMember(profileId: string): boolean {
    return this.selectedMembers().includes(profileId);
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    
    if (this.assignmentType() === 'individual' && this.selectedMembers().length === 0) {
      alert('Debes seleccionar al menos un miembro.');
      return;
    }

    this.isLoading.set(true);

    const taskData: any = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description || '',
      due_date: this.taskForm.value.due_date
    };

    if (this.assignmentType() === 'individual') {
      taskData.assignee_ids = this.selectedMembers();
      taskData.is_individual = true;
    }

    this.tasksService.createTask(this.groupId, taskData).subscribe({
      next: (res) => {
        this.loadTasks();
        this.toggleForm();
        const msg = this.assignmentType() === 'individual' 
          ? `Tarea asignada a ${this.selectedMembers().length} miembro(s) específico(s).`
          : 'Tarea asignada a todos los miembros del grupo.';
        alert(msg);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        alert(err.error?.message || 'Error al crear la tarea');
      }
    });
  }

  deleteTask(taskId: string) {
    if (confirm('¿Eliminar esta tarea? Se borrará para todos los asignados.')) {
      this.tasksService.deleteTask(this.groupId, taskId).subscribe({
        next: () => this.loadTasks(),
        error: (err) => alert('Error al eliminar la tarea')
      });
    }
  }
}