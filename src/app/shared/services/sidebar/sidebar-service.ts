import { Injectable, signal, effect, DestroyRef, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly STORAGE_KEY = 'sidebar-collapsed';
  private readonly _isCollapsed = signal(this.getInitialState());
  private readonly _isMobileOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.isDesktop()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._isCollapsed()));
      }
    });

    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (this.isDesktop()) {
          this._isMobileOpen.set(false);
        }
      };

      window.addEventListener('resize', handleResize);
      
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', handleResize);
      });
    }
  }

  get isCollapsed() {
    return this._isCollapsed.asReadonly();
  }

  get isMobileOpen() {
    return this._isMobileOpen.asReadonly();
  }

  toggle(): void {
    if (this.isMobile()) {
      this._isMobileOpen.update(value => !value);
    } else {
      this._isCollapsed.update(value => !value);
    }
  }

  collapse(): void {
    this._isCollapsed.set(true);
  }

  expand(): void {
    this._isCollapsed.set(false);
  }

  closeMobile(): void {
    this._isMobileOpen.set(false);
  }

  openMobile(): void {
    this._isMobileOpen.set(true);
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  }

  private isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 640;
  }

  private getInitialState(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  }
}
