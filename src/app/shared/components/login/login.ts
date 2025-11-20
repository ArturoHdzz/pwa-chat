import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  error = '';
  isLoading = false;
  form;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        console.log('Respuesta del login:', res);
        this.auth.guardarToken(res.token, res.user);
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.isLoading = false;
        
        if (err.error?.errors) {
          const errores = err.error.errors;
          this.error = Object.values(errores)
            .map((e: any) => Array.isArray(e) ? e[0] : e)
            .join(' ');
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que Laravel esté corriendo.';
        } else {
          this.error = 'Error desconocido. Intenta de nuevo.';
        }
      }
    });
  }

  get emailControl() {
    return this.form.get('email');
  }

  get passwordControl() {
    return this.form.get('password');
  }
}
