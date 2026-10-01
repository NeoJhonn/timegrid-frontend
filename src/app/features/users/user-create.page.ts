import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  protected readonly editingUser = signal<UserResponse | null>(null);
  protected readonly deletingUser = signal<UserResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly showCreatePassword = signal(false);
  protected readonly showEditCurrentPassword = signal(false);
  protected readonly showEditNewPassword = signal(false);

  protected readonly createForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['ADMIN' as UserRole, Validators.required],
  });

  protected readonly editForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
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
          this.loadData();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível criar o usuário.'));
        },
      });
  }

  protected openEdit(user: UserResponse): void {
    this.editingUser.set(user);
    this.editForm.setValue({
      username: user.username,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      role: user.role,
    });
  }

  protected closeEdit(): void {
    this.editingUser.set(null);
    this.editForm.reset({
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      role: 'ADMIN',
    });
  }

  protected saveEdit(): void {
    const user = this.editingUser();

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

  protected toggleEditCurrentPassword(): void {
    this.showEditCurrentPassword.update((value) => !value);
  }

  protected toggleEditNewPassword(): void {
    this.showEditNewPassword.update((value) => !value);
  }
}
