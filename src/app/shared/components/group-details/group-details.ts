import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsService } from '../../services/Groups/groups-service';
import { Group } from '../../../shared/models/group.model';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './group-details.html'
})
export class GroupDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);

  group = signal<Group | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGroup(id);
    } else {
      this.router.navigate(['/groups']);
    }
  }

  loadGroup(id: string) {
    this.groupsService.getGroup(id).subscribe({
      next: (data) => {
        this.group.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading group', err);
        this.router.navigate(['/groups']);
      }
    });
  }
}
