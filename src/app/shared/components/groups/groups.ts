import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GroupsService } from '../../services/Groups/groups-service';
import { Group } from '../../models/group.model';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './groups.html'
})
export class Groups implements OnInit {
  private readonly groupsService = inject(GroupsService);
  private readonly fb = inject(FormBuilder);

  groups = signal<Group[]>([]);
  isLoading = signal(false);
  showForm = signal(false);

  groupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    is_class: [true]
  });

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.isLoading.set(true);
    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando grupos', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.groupForm.reset({ is_class: true });
    }
  }

  onSubmit() {
    if (this.groupForm.valid) {
      this.isLoading.set(true);
      this.groupsService.createGroup(this.groupForm.value as any).subscribe({
        next: (res) => {
          this.groups.update(current => [res.group, ...current]);
          this.toggleForm(); 
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error creando grupo', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  deleteGroup(id: string) {
    if(confirm('¿Estás seguro de eliminar este grupo?')) {
      this.groupsService.deleteGroup(id).subscribe({
        next: () => {
          this.groups.update(current => current.filter(g => g.id !== id));
        }
      });
    }
  }
}
