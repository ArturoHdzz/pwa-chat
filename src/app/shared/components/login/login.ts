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
  form;

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.auth.guardarToken(res.token, res.user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        if (err.error?.errors) {
          const errores = err.error.errors;
          this.error = Object.values(errores).map((e: any) => e[0]).join(' ');
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error desconocido. Intenta de nuevo.';
        }
      }
    });
  }
}
