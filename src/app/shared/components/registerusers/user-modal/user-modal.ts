import { Component, inject, signal, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../../services/user/users-service';
import { User, UpdateUserRequest, UserFormData } from '../../../models/user.model';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css'
})
export class UserModal implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();
  @Output() userDeleted = new EventEmitter<number>();

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  readonly isLoading = signal(false);
  readonly isTogglingStatus = signal(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');
  readonly showDeleteConfirm = signal(false);

  userForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.initializeForm();
      this.populateForm();
      this.clearMessages();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      apellido_materno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: [''],
      confirmPassword: [''],
      activo: [true]
    }, { validators: this.passwordMatchValidator });
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        apellido_paterno: this.user.apellido_paterno,
        apellido_materno: this.user.apellido_materno,
        email: this.user.email,
        telefono: this.user.telefono,
        activo: this.user.activo ?? true
      });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
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
    if (errors['pattern']) return 'Formato inválido (10 dígitos)';
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
    if (this.userForm.invalid || !this.user?.id) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    const formValue = this.userForm.value as UserFormData;
    const updateData: UpdateUserRequest = {
      name: formValue.name,
      apellido_paterno: formValue.apellido_paterno,
      apellido_materno: formValue.apellido_materno,
      email: formValue.email,
      telefono: formValue.telefono,
      activo: formValue.activo
    };

    if (formValue.password?.trim()) {
      updateData.password = formValue.password;
    }

    this.usersService.updateUser(this.user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.successMessage.set('Usuario actualizado exitosamente');
        this.userUpdated.emit(updatedUser);
        this.isLoading.set(false);
        setTimeout(() => this.onClose(), 1500);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al actualizar el usuario');
        this.isLoading.set(false);
      }
    });
  }

  onToggleStatus(): void {
    if (!this.user?.id) return;

    this.isTogglingStatus.set(true);
    this.clearMessages();

    const newStatus = !this.user.activo;
    const statusText = newStatus ? 'activado' : 'desactivado';

    this.usersService.toggleUserStatus(this.user.id, newStatus).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.userForm.patchValue({ activo: newStatus });
        this.successMessage.set(`Usuario ${statusText} exitosamente`);
        this.userUpdated.emit(updatedUser);
        this.isTogglingStatus.set(false);
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.message || `Error al ${newStatus ? 'activar' : 'desactivar'} el usuario`);
        this.isTogglingStatus.set(false);
      }
    });
  }

  onDeleteUser(): void {
    if (!this.user?.id) return;

    this.isLoading.set(true);
    this.clearMessages();

    this.usersService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.userDeleted.emit(this.user!.id!);
        this.onClose();
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al eliminar el usuario');
        this.showDeleteConfirm.set(false);
        this.isLoading.set(false);
      }
    });
  }

  onShowDeleteConfirm(): void {
    this.showDeleteConfirm.set(true);
    this.clearMessages();
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  onClose(): void {
    this.userForm.reset();
    this.clearMessages();
    this.showDeleteConfirm.set(false);
    this.closeModal.emit();
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(field => {
      this.userForm.get(field)?.markAsTouched();
    });
  }
}
