import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  @Input() showMobileToggle = false;
  @Output() mobileToggle = new EventEmitter<void>();

  onMobileToggle(): void {
    this.mobileToggle.emit();
  }
}
