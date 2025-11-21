import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserProfile } from '../../models/profile.model';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Input() showMobileToggle = false;
  @Output() mobileToggle = new EventEmitter<void>();

  readonly showProfileDropdown = signal(false);
  readonly currentUser = signal<UserProfile | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    if (typeof window !== 'undefined' && localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUser.set(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }

    this.authService.auth().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        if (typeof window !== 'undefined' && localStorage) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    
    const firstInitial = user.name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.apellido_paterno?.charAt(0)?.toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}` || 'U';
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown.set(!this.showProfileDropdown());
  }

  closeProfileDropdown(): void {
    this.showProfileDropdown.set(false);
  }

  onMobileToggle(): void {
    this.mobileToggle.emit();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        if (typeof window !== 'undefined' && localStorage) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        this.router.navigate(['/login']);
      }
    });
  }
}
