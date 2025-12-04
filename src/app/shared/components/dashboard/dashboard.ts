import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard/dashboard-service';
import { Router } from '@angular/router'; 
import { Spiner } from '../movil/spiner/spiner'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Spiner],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router); 

  data = signal<any>(null);
  
  isLoading = signal(true);
  
  isSyncing = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const cachedData = localStorage.getItem('dashboard_cache');
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        this.data.set(parsed);
        this.isLoading.set(false); 
        this.isSyncing.set(true); 
      } catch (e) {
        console.error('Error caché', e);
      }
    } else {
      this.isLoading.set(true);
    }

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.is_student) {
            this.router.navigate(['/groups']);
            return;
        }
        
        this.data.set(res);
        
        this.isLoading.set(false);
        this.isSyncing.set(false);
        
        localStorage.setItem('dashboard_cache', JSON.stringify(res));
      },
      error: (err) => {
        console.error('Error de red:', err);
        this.isLoading.set(false);
        this.isSyncing.set(false); 
      }
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Código de organización copiado: ' + code);
  }
}
