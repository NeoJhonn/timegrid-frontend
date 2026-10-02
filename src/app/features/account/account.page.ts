import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserResponse } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';

@Component({
  selector: 'app-account-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './account.page.html',
  styleUrl: './account.page.scss',
})
export class AccountPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApiService);

  protected readonly account = signal<UserResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly passwordModalOpen = signal(false);
  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);

  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadAccount();
  }

  protected loadAccount(): void {
    const userId = this.authService.currentUser()?.userId;

    if (!userId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.userApi
      .findById(userId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (user) => this.account.set(user),
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar sua conta.'));
        },
      });
  }

  protected updatePassword(): void {
    const user = this.account();

    if (!user || this.passwordForm.invalid || this.saving()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.userApi
      .update(user.id, {
        username: user.username,
        email: user.email,
        password: this.passwordForm.controls.newPassword.value,
        role: user.role,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updatedUser) => {
          this.account.set(updatedUser);
          this.passwordForm.reset();
          this.closePasswordModal();
          this.message.set('Senha atualizada com sucesso.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível atualizar sua senha.'));
        },
      });
  }

  protected openPasswordModal(): void {
    this.message.set('');
    this.errorMessage.set('');
    this.passwordForm.reset();
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.passwordModalOpen.set(true);
  }

  protected closePasswordModal(): void {
    this.passwordModalOpen.set(false);
    this.passwordForm.reset();
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
  }

  protected toggleCurrentPassword(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  protected toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }
}
