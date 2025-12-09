import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks/tasks-service';
import { Spiner } from '../movil/spiner/spiner';

@Component({
  selector: 'app-task-grading',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spiner],
  templateUrl: './task-grading.html'
})
export class TaskGrading implements OnInit {
  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);

  groupId: string = '';
  taskId: string = '';
  task: any = null;
  isLoading = signal(true);

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
    
    if (this.groupId && this.taskId) {
      this.loadTaskDetails();
    }
  }

  loadTaskDetails() {
    this.isLoading.set(true);
    this.tasksService.getTaskDetails(this.groupId, this.taskId).subscribe({
      next: (data) => {
        this.task = data;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  parseSubmission(content: string): any {
    try {
      return JSON.parse(content);
    } catch (e) {
      return { text: content, supabase_url: null };
    }
  }

  openFile(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  saveGrade(student: any) {
    if (student.pivot.grade < 0 || student.pivot.grade > 100) {
      alert('La calificación debe ser entre 0 y 100');
      return;
    }

    this.tasksService.gradeTask(
      this.groupId, 
      this.taskId, 
      student.id, 
      student.pivot.grade, 
      student.pivot.feedback
    ).subscribe({
      next: () => {
        alert(`Calificación guardada para ${student.display_name}`);
        student.pivot.status = 'graded'; 
      },
      error: () => alert('Error al guardar calificación')
    });
  }
}
