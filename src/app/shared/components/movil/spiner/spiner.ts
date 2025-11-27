import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-spiner',
   imports: [CommonModule],
  templateUrl: './spiner.html',
  styleUrl: './spiner.css'
})
export class Spiner {
 @Input() show = false;
  @Input() message = 'Cargando información...';
}
