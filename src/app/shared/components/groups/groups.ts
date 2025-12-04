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
  
  isLoading = signal(true);
  
  isSyncing = signal(false);
  
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
    const cachedData = localStorage.getItem('groups_cache');
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        this.groups.set(parsed);
        this.isLoading.set(false);
        this.isSyncing.set(true);
      } catch (e) {
        console.error('Error leyendo caché de grupos', e);
      }
    } else {
      this.isLoading.set(true);
    }

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups.set(data);
        
        this.isLoading.set(false);
        this.isSyncing.set(false);
        
        this.updateCache(data);
      },
      error: (err) => {
        console.error('Error cargando grupos', err);
        this.isLoading.set(false);
        this.isSyncing.set(false);
      }
    });
  }

  private updateCache(data: Group[]) {
    localStorage.setItem('groups_cache', JSON.stringify(data));
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
          const newGroups = [res.group, ...this.groups()];
          this.groups.set(newGroups);
          this.updateCache(newGroups);

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
        const newGroups = [res.group, ...this.groups()];
        this.groups.set(newGroups);
        this.updateCache(newGroups);

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
          const filteredGroups = this.groups().filter(g => g.id !== id);
          this.groups.set(filteredGroups);
          this.updateCache(filteredGroups);
        }
      });
    }
  }
}
