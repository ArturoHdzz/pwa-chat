import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GroupsService } from '../../services/Groups/groups-service';
import { Group } from '../../models/group.model';
import { Spiner } from '../movil/spiner/spiner'; 

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, Spiner],
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

  activeForm = signal<'create' | 'join' | null>(null);
  joinCode = ''; 

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

  toggleForm(type: 'create' | 'join' | null) {
    this.activeForm.set(this.activeForm() === type ? null : type);
    if (type === 'create') {
      this.groupForm.reset({ is_class: true });
    }
    if (type === 'join') {
      this.joinCode = '';
    }
  }

  onSubmit() {
    if (this.groupForm.valid) {
      this.isLoading.set(true);
      this.groupsService.createGroup(this.groupForm.value as any).subscribe({
        next: (res) => {
          this.groups.update(current => [res.group, ...current]);
          this.toggleForm(null); 
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error creando grupo', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  onJoinSubmit() {
    if (!this.joinCode.trim()) return;
    
    this.isLoading.set(true);
    this.groupsService.joinGroup(this.joinCode).subscribe({
      next: (res) => {
        this.groups.update(current => [res.group, ...current]);
        this.toggleForm(null);
        this.isLoading.set(false);
        alert('¡Te has unido a la clase!');
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        alert(err.error?.message || 'Error al unirse al grupo');
      }
    });
  }
  
  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Código copiado: ' + code);
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
