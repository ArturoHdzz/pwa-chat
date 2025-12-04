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
  
  isOfflineData = signal(false);

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
        this.isOfflineData.set(true);
      } catch (e) {
        console.error('Error al leer caché', e);
      }
    }

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.is_student) {
            this.router.navigate(['/groups']);
            return;
        }
        
        this.data.set(res);
        this.isLoading.set(false);
        this.isOfflineData.set(false);
        
        localStorage.setItem('dashboard_cache', JSON.stringify(res));
      },
      error: (err) => {
        console.error('Error de red o servidor:', err);
        this.isLoading.set(false);
      }
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Código de organización copiado: ' + code);
  }
}
