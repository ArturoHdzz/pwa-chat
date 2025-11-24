import { Component, inject, computed, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar/sidebar-service';
import { NavigationItem } from '../../models/navigation.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);

  readonly isCollapsed = this.sidebarService.isCollapsed;
  readonly isMobileOpen = this.sidebarService.isMobileOpen;

  readonly sidebarClasses = computed(() => {
    const baseClasses = 'fixed top-0 left-0 z-50 h-screen transition-transform duration-300 bg-slate-800 flex flex-col shadow-lg';
    const widthClasses = this.isCollapsed() ? 'w-16' : 'w-64';
    
    const mobileClasses = this.isMobileOpen() 
      ? 'translate-x-0' 
      : '-translate-x-full sm:translate-x-0';
    
    return `${baseClasses} ${widthClasses} ${mobileClasses}`;
  });

  readonly navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      route: '/home'
    },
    {
      id: 'groups',
      label: 'Grupos / Clases',
      icon: 'groups', 
      route: '/groups'
    },
    {
      id: 'operaciones',
      label: 'Pperaciones(Matrix)',
      icon: 'operaciones',
      route: '/operaciones'
    }
  ];

  onToggleSidebar(): void {
    this.sidebarService.toggle();
  }

  onNavigate(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile()) {
      this.sidebarService.closeMobile();
    }
  }

  onCloseMobileOverlay(): void {
    this.sidebarService.closeMobile();
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isMobile() && this.isMobileOpen()) {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('app-sidebar');
      const toggleButton = document.querySelector('[data-mobile-toggle]');
      
      if (sidebar && !sidebar.contains(target) && !toggleButton?.contains(target)) {
        this.sidebarService.closeMobile();
      }
    }
  }
}
