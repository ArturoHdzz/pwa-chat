import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GroupsService } from '../../../services/Groups/groups-service';
import { FormsModule } from '@angular/forms';
import { Spiner } from '../../movil/spiner/spiner'; 

@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Spiner], 
  templateUrl: './group-members.html'
})
export class GroupMembers implements OnInit {
  private route = inject(ActivatedRoute);
  private groupsService = inject(GroupsService);

  groupId: string = '';
  members = signal<any[]>([]);
  availableUsers = signal<any[]>([]);
  searchTerm: string = '';
  isLoading = signal(true);

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading.set(true);

    this.groupsService.getGroupMembers(this.groupId).subscribe({
      next: (data: any[]) => {
        this.members.set(data);

        this.groupsService.getAvailableUsers(this.groupId).subscribe({
          next: (available: any[]) => {
            this.availableUsers.set(available);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredAvailable() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      return [];
    }

    return this.availableUsers().filter(u => 
      u.display_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  addMember(profileId: string) {
    this.groupsService.addMember(this.groupId, profileId).subscribe({
      next: () => {
        this.loadData(); 
        this.searchTerm = '';
      },
      error: (err: any) => alert('Error al agregar miembro')
    });
  }

  removeMember(profileId: string) {
    if(confirm('¿Quitar a este usuario del grupo?')) {
      this.groupsService.removeMember(this.groupId, profileId).subscribe({
        next: () => {
          this.loadData(); 
        }
      });
    }
  }
}
