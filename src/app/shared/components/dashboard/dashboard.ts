import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard/dashboard-service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router); 

  data = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.is_student) {
            this.router.navigate(['/groups']);
            return;
        }
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Código de organización copiado: ' + code);
  }
}
