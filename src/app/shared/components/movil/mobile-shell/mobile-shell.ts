import { Component } from '@angular/core';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-mobile-shell',
  imports: [
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
  templateUrl: './mobile-shell.html',
  styleUrl: './mobile-shell.css'
})
export class MobileShell {

}
