import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../services/user/users-service';
import { UserModal } from '../registerusers/user-modal/user-modal';
import { CreateUserRequest, User } from '../../models/user.model';

@Component({
  selector: 'app-registerusers',
  imports: [CommonModule, ReactiveFormsModule, UserModal],
  templateUrl: './registerusers.html',
  styleUrl: './registerusers.css'
})
export class Registerusers {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');
  readonly users = signal<User[]>([]);
  readonly selectedUser = signal<User | null>(null);
  readonly isModalOpen = signal(false);

  readonly userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    apellido_paterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    apellido_materno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    this.loadUsers();
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  get formControls() {
    return this.userForm.controls;
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    const errors = field.errors;
    
    if (errors['required']) return `El campo ${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    
    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'nombre',
      apellido_paterno: 'apellido paterno',
      apellido_materno: 'apellido materno',
      email: 'email',
      telefono: 'teléfono',
      password: 'contraseña',
      confirmPassword: 'confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirmPassword, ...userData } = this.userForm.value;
    
    this.usersService.createUser(userData as CreateUserRequest).subscribe({
      next: (response) => {
        this.successMessage.set('Usuario creado exitosamente');
        this.userForm.reset();
        this.loadUsers();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al crear el usuario');
        this.isLoading.set(false);
      }
    });
  }

  onEditUser(user: User): void {
    this.selectedUser.set(user);
    this.isModalOpen.set(true);
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  onUserUpdated(updatedUser: User): void {
    const currentUsers = this.users();
    const index = currentUsers.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      currentUsers[index] = updatedUser;
      this.users.set([...currentUsers]);
    }
  }

  onUserDeleted(userId: number): void {
    const currentUsers = this.users().filter(u => u.id !== userId);
    this.users.set(currentUsers);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(field => {
      this.userForm.get(field)?.markAsTouched();
    });
  }

  private loadUsers(): void {
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onReset(): void {
    this.userForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
