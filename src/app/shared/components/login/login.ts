import { Component, signal } from '@angular/core';
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { AuthService, RegisterRequest } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '../../services/chat/device-service';
import { PwaInstall } from '../../services/chat/pwa-install';
import { FormsModule } from '@angular/forms';
declare var window: any;
declare var turnstile: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  @ViewChild('loginTurnstile') loginTurnstile?: ElementRef<HTMLDivElement>;
  @ViewChild('registerTurnstile') registerTurnstile?: ElementRef<HTMLDivElement>;
  ngAfterViewInit(): void {
    this.renderTurnstiles();
  }

  private renderTurnstiles() {
    // Esperar a que el script de Turnstile haya cargado
    if (!window.turnstile) {
      setTimeout(() => this.renderTurnstiles(), 300);
      return;
    }

    // LOGIN
    if (this.loginTurnstile && this.loginTurnstile.nativeElement.childElementCount === 0) {
      window.turnstile.render(this.loginTurnstile.nativeElement, {
        sitekey: '0x4AAAAAACFgUbeOp-unIk0Q',
        callback: (token: string) => {
          this.turnstileLoginToken = token;
          console.log('Login token:', token);
        },
        theme: 'light',
      });
    }

    // REGISTER
    if (this.registerTurnstile && this.registerTurnstile.nativeElement.childElementCount === 0) {
      window.turnstile.render(this.registerTurnstile.nativeElement, {
        sitekey: '0x4AAAAAACFgUbeOp-unIk0Q',
        callback: (token: string) => {
          this.turnstileRegisterToken = token;
          console.log('Register token:', token);
        },
        theme: 'light',
      });
    }
  }

  turnstileLoginToken: string | null = null;
  turnstileRegisterToken: string | null = null;

  error = '';
  isLoading = false;
  showRegister = signal(false);
  
  isJoiningOrg = signal(false); 
  show2FA = signal(false);
  tempUserId: number | null = null; 
  twoFactorCode = ''; 

  loginForm;
  registerForm;

  showEmailVerification = signal(false); 
  tempEmail: string = ''; 
  verificationCode = ''; 

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private fb: FormBuilder,
    public pwa:PwaInstall,
    private deviceService: DeviceService 
  ) {
//  (window as any).onTurnstileLoginSuccess = (token: string) => {
//       this.turnstileLoginToken = token;
//     };

//     (window as any).onTurnstileRegisterSuccess = (token: string) => {
//       this.turnstileRegisterToken = token;
//     };


    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2)]],
      apellido_materno: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_#-])/)
      ]],

      confirmPassword: ['', [Validators.required]],
      role: ['jefe', [Validators.required]],
      organization_name: ['', [Validators.required, Validators.minLength(3)]],
      organization_code: [''] 
    }, { validators: this.passwordMatchValidator });
  }

  install() {

  if (this.isIOS()) {
    alert(
      'Para instalar la app:\n\n' +
      '1. Toca el botón "Compartir" (icono de cuadrado con flecha hacia arriba).\n' +
      '2. Elige "Añadir a pantalla de inicio".'
    );
  } else {
    this.pwa.installApp();
  }
}

isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  toggleOrgMode(join: boolean) {
    this.isJoiningOrg.set(join);
    
    const nameControl = this.registerForm.get('organization_name');
    const codeControl = this.registerForm.get('organization_code');

    if (join) {
      nameControl?.clearValidators();
      nameControl?.setValue('');
      codeControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      codeControl?.clearValidators();
      codeControl?.setValue('');
      nameControl?.setValidators([Validators.required, Validators.minLength(3)]);
    }
    
    nameControl?.updateValueAndValidity();
    codeControl?.updateValueAndValidity();
  }

  toggleForm() {
    this.showRegister.set(!this.showRegister());
    this.error = '';


    
    if (this.showRegister()) {
        this.toggleOrgMode(false); 
    }
    setTimeout(() => this.renderTurnstiles(), 300);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
if (!this.turnstileLoginToken) {
    this.error = 'Por favor completa la verificación de seguridad.';
    return;
  }

    this.isLoading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!, this.turnstileLoginToken).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (res.require_2fa) {
          this.tempUserId = res.user_id;
          this.show2FA.set(true); 
          return;
        }
        
        this.handleLoginSuccess(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }

  onVerifyCode() {
    if (!this.twoFactorCode || !this.tempUserId) return;
    
    this.isLoading = true;
    this.error = '';

    this.auth.verify2fa(this.tempUserId, this.twoFactorCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.handleLoginSuccess(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Código inválido';
      }
    });
  }

  handleLoginSuccess(res: any) {
    const user = res.user || JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.profile?.role || user.role;
    const isMobile = this.deviceService.isMobile();

    if (!isMobile && (role === 'Alumno' || role === 'User' || role === 'student')) {
      window.location.reload();
      this.error = 'Acceso restringido: Los alumnos solo pueden ingresar desde la aplicación móvil.';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }
    this.router.navigate(['/home']);
  }

  onRegister() {
    if (!this.turnstileRegisterToken) {
    this.error = 'Por favor completa la verificación de seguridad.';
    return;
  }

    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.error = '';

    const formValue = this.registerForm.value;
    const userData: RegisterRequest = {
        name: formValue.name!,
        apellido_paterno: formValue.apellido_paterno!,
        apellido_materno: formValue.apellido_materno!,
        email: formValue.email!,
        telefono: formValue.telefono!,
        password: formValue.password!,
        role: formValue.role! as 'jefe' | 'profesor',
        organization_name: this.isJoiningOrg() ? undefined : formValue.organization_name!,
        turnstile_token: this.turnstileRegisterToken,
        organization_code: this.isJoiningOrg() && formValue.organization_code ? formValue.organization_code.trim() : undefined
    };

    this.auth.register(userData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.require_email_verification) {
          this.tempEmail = res.email;
          this.showEmailVerification.set(true); 
          this.showRegister.set(false); 
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.errors) {
            const errors = Object.values(err.error.errors).flat();
            this.error = errors.join(', '); 
        } else {
            this.error = err.error?.message || 'Error al registrar';
        }
      }
    });
  }

  onVerifyEmail() {
    if (!this.verificationCode) return;
    this.isLoading = true;
    
    this.auth.verifyEmail(this.tempEmail, this.verificationCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showEmailVerification.set(false);
        this.handleLoginSuccess(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Código incorrecto';
      }
    });
  }

  getFieldError(fieldName: string, formGroup: any): string {
    const field = formGroup.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) {
        if (fieldName === 'password') {
            return 'Requiere Mayúscula, minúscula, número y símbolo';
        }
        return 'Formato inválido (10 dígitos)';
    }
    if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    
    return 'Campo inválido';
  }
}
