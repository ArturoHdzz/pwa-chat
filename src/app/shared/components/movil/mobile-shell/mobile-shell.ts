import { Component } from '@angular/core';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonFooter,
    IonToolbar,
  IonTabButton,
  IonButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonApp,
} from '@ionic/angular/standalone';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-mobile-shell',
  imports: [
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonButton,
    IonButtons,
    IonFooter,
    RouterOutlet,
    IonToolbar,
    IonIcon,
    IonLabel,
    IonApp,

  ],
  templateUrl: './mobile-shell.html',
  styleUrl: './mobile-shell.css'
})
export class MobileShell {

}
