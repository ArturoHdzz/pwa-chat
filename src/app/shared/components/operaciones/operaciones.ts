import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OperacionesService } from '../../services/operaciones/operaciones-service';

@Component({
  selector: 'app-operaciones',
  imports: [CommonModule, DatePipe],
  templateUrl: './operaciones.html',
  styleUrl: './operaciones.css'
})
export class Operaciones implements OnInit {

  operaciones: any[] = [];

  constructor(private operacionService: OperacionesService) {}

  ngOnInit(): void {
    this.operacionService.getOperaciones().subscribe({
      next: (data) => {
        this.operaciones = data;
      },
      error: (err) => {
        console.error('Error al obtener operaciones', err);
      }
    });
  }
}