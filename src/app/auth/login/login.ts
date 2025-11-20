import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonButton, IonIcon,
  IonItem, IonInput,  IonNote, IonSpinner, 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule, FormsModule,
    IonContent,IonButton, IonIcon,
    IonItem, IonInput, IonNote, IonSpinner, 
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
email = '';
  password = '';
  showPass = false;

  loading = signal(false);
  error = signal<string|undefined>(undefined);

  constructor(private router: Router) {}

  async submit() {
    this.error.set(undefined);
    if (!this.email || !this.password) {
      this.error.set('Ingresa tu correo y contraseña');
      return;
    }
    try {
      this.loading.set(true);

      await new Promise(res => setTimeout(res, 800));

      this.router.navigateByUrl('/chat');
    } catch (e: any) {
      this.error.set('No pudimos iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }
}

