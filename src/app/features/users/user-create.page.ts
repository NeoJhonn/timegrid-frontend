import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserApiService } from '../../core/services/user-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';

@Component({
  selector: 'app-user-create-page',
  imports: [ReactiveFormsModule],
  templateUrl: './user-create.page.html',
  styleUrl: './user-create.page.scss',
})
export class UserCreatePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userApi = inject(UserApiService);

  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['ADMIN' as const, Validators.required],
  });

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.userApi
      .create(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) => {
          this.message.set(`Usuario ${user.username} criado com sucesso.`);
          this.form.reset({ username: '', email: '', password: '', role: 'ADMIN' });
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel criar o usuario.'));
        },
      });
  }
}

