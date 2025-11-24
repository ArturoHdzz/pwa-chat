import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
@Component({
  selector: 'app-root',
  imports: [
    IonApp, RouterOutlet,

  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pwa');
}
