import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { UserRole } from '../../core/models/auth.model';
import { UserResponse } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';

@Component({
  selector: 'app-user-create-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './user-create.page.html',
  styleUrl: './user-create.page.scss',
})
export class UserCreatePage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApiService);

  protected readonly users = signal<UserResponse[]>([]);
  protected readonly currentAccount = signal<UserResponse | null>(null);
  protected readonly createModalOpen = signal(false);
  protected readonly editingUser = signal<UserResponse | null>(null);
  protected readonly deletingUser = signal<UserResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly showCreatePassword = signal(false);
  protected readonly showEditNewPassword = signal(false);
  protected readonly editSubmitAttempted = signal(false);

  protected readonly createForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.passwordValidator]],
    role: ['ADMIN' as UserRole, Validators.required],
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, this.passwordValidator]],
    role: ['ADMIN' as UserRole, Validators.required],
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    const userId = this.authService.currentUser()?.userId;

    this.loading.set(true);
    this.errorMessage.set('');

    this.userApi
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.currentAccount.set(users.find((user) => user.id === userId) ?? null);
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar usuários.'));
        },
      });
  }

  protected createUser(): void {
    this.createForm.setValue({
      username: this.createForm.controls.username.value.trim(),
      email: this.createForm.controls.email.value.trim(),
      password: this.createForm.controls.password.value.trim(),
      role: this.createForm.controls.role.value,
    });

    if (this.createForm.invalid || this.saving()) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.userApi
      .create(this.createForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) => {
          this.message.set(`Usuario ${user.username} criado com sucesso.`);
          this.createForm.reset({ username: '', email: '', password: '', role: 'ADMIN' });
          this.closeCreate();
          this.loadData();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível criar o usuário.'));
        },
      });
  }

  protected openCreate(): void {
    this.createForm.reset({ username: '', email: '', password: '', role: 'ADMIN' });
    this.showCreatePassword.set(false);
    this.message.set('');
    this.errorMessage.set('');
    this.createModalOpen.set(true);
  }

  protected closeCreate(): void {
    this.createModalOpen.set(false);
    this.showCreatePassword.set(false);
    this.createForm.reset({ username: '', email: '', password: '', role: 'ADMIN' });
  }

  protected openEdit(user: UserResponse): void {
    this.editingUser.set(user);
    this.showEditNewPassword.set(false);
    this.editSubmitAttempted.set(false);
    this.editForm.setValue({
      username: user.username,
      email: user.email,
      newPassword: '',
      role: user.role,
    });
  }

  protected closeEdit(): void {
    this.editingUser.set(null);
    this.showEditNewPassword.set(false);
    this.editSubmitAttempted.set(false);
    this.editForm.reset({
      username: '',
      email: '',
      newPassword: '',
      role: 'ADMIN',
    });
  }

  protected saveEdit(): void {
    const user = this.editingUser();
    this.editSubmitAttempted.set(true);

    this.editForm.setValue({
      username: this.editForm.controls.username.value.trim(),
      email: this.editForm.controls.email.value.trim(),
      newPassword: this.editForm.controls.newPassword.value.trim(),
      role: this.editForm.controls.role.value,
    });

    if (!user || this.editForm.invalid || this.saving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.userApi
      .update(user.id, {
        username: this.editForm.controls.username.value,
        email: this.editForm.controls.email.value,
        password: this.editForm.controls.newPassword.value,
        role: this.editForm.controls.role.value,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updatedUser) => {
          this.message.set(`Usuário ${updatedUser.username} atualizado.`);
          this.closeEdit();
          this.loadData();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível atualizar o usuário.'));
        },
      });
  }

  protected openDelete(user: UserResponse): void {
    this.deletingUser.set(user);
  }

  protected closeDelete(): void {
    this.deletingUser.set(null);
  }

  protected confirmDelete(): void {
    const user = this.deletingUser();

    if (!user || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.userApi
      .delete(user.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set(`Usuario ${user.username} removido.`);
          this.closeDelete();
          this.loadData();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível remover o usuário.'));
        },
      });
  }

  protected toggleCreatePassword(): void {
    this.showCreatePassword.update((value) => !value);
  }

  protected toggleEditNewPassword(): void {
    this.showEditNewPassword.update((value) => !value);
  }

  protected passwordMessage(control: AbstractControl<string>): string {
    if (control.errors?.['required']) {
      return 'Informe a nova senha.';
    }

    return control.errors?.['passwordStrength']
      ? 'Use no minimo 8 caracteres, com letra maiuscula e minuscula.'
      : 'Informe uma senha.';
  }

  private passwordValidator(control: AbstractControl<string>): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);

    return hasMinLength && hasUppercase && hasLowercase ? null : { passwordStrength: true };
  }
}
