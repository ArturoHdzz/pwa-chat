import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { SidebarService } from '../../services/sidebar/sidebar-service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  private readonly sidebarService = inject(SidebarService);
  
  readonly isCollapsed = this.sidebarService.isCollapsed;
  readonly isMobileOpen = this.sidebarService.isMobileOpen;

  readonly mainContentClasses = computed(() => {
    const baseClasses = 'flex-1 transition-all duration-300 min-h-screen';
    const marginClasses = this.isCollapsed() ? 'sm:ml-16' : 'sm:ml-64';
    
    return `${baseClasses} ${marginClasses}`;
  });

  onToggleMobileSidebar(): void {
    this.sidebarService.toggle();
  }
}
