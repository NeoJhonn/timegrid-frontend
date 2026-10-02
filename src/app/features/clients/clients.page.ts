import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { ClientResponse } from '../../core/models/client.model';
import { AuthService } from '../../core/services/auth.service';
import { ClientApiService } from '../../core/services/client-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';

@Component({
  selector: 'app-clients-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './clients.page.html',
  styleUrl: './clients.page.scss',
})
export class ClientsPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly clientApi = inject(ClientApiService);

  protected readonly clients = signal<ClientResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly editingClient = signal<ClientResponse | null>(null);
  protected readonly clientModalOpen = signal(false);
  protected readonly search = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, this.phoneValidator]],
  });

  protected readonly filteredClients = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.clients();
    }

    return this.clients().filter((client) => {
      const phone = this.formatPhone(client.phone);
      const digits = this.onlyDigits(client.phone);
      return `${client.name} ${phone} ${digits}`.toLowerCase().includes(term);
    });
  });

  ngOnInit(): void {
    this.loadClients();
  }

  protected loadClients(): void {
    const userId = this.userId();

    if (!userId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.clientApi
      .list(userId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (clients) => this.clients.set(clients),
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar clientes.'));
        },
      });
  }

  protected submit(): void {
    const userId = this.userId();

    this.form.setValue({
      name: this.form.controls.name.value.trim(),
      phone: this.form.controls.phone.value.trim(),
    });

    if (!userId || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    const rawValue = this.form.getRawValue();
    const request = {
      name: rawValue.name.trim(),
      phone: this.onlyDigits(rawValue.phone),
    };
    const editing = this.editingClient();
    const operation = editing
      ? this.clientApi.update(userId, editing.id, request)
      : this.clientApi.create(userId, request);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.message.set(editing ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado.');
        this.cancelEdit();
        this.loadClients();
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível salvar o cliente.'));
      },
    });
  }

  protected edit(client: ClientResponse): void {
    this.editingClient.set(client);
    this.clientModalOpen.set(true);
    this.message.set('');
    this.errorMessage.set('');
    this.form.setValue({
      name: client.name,
      phone: this.formatPhone(client.phone),
    });
  }

  protected openCreateModal(): void {
    this.editingClient.set(null);
    this.form.reset();
    this.message.set('');
    this.errorMessage.set('');
    this.clientModalOpen.set(true);
  }

  protected cancelEdit(): void {
    this.editingClient.set(null);
    this.clientModalOpen.set(false);
    this.form.reset();
  }

  protected delete(client: ClientResponse): void {
    const userId = this.userId();

    if (!userId) {
      return;
    }

    this.errorMessage.set('');
    this.message.set('');

    this.clientApi.delete(userId, client.id).subscribe({
      next: () => {
        this.message.set('Cliente removido.');
        this.loadClients();
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível remover o cliente.'));
      },
    });
  }

  protected updateSearch(value: string): void {
    this.search.set(value);
  }

  protected updatePhone(value: string): void {
    this.form.controls.phone.setValue(this.formatPhone(value));
  }

  protected formatPhone(value: string): string {
    const digits = this.onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) {
      return digits ? `(${digits}` : '';
    }

    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);
    const firstPartSize = digits.length > 10 ? 5 : 4;
    const firstPart = number.slice(0, firstPartSize);
    const secondPart = number.slice(firstPartSize);

    return secondPart ? `(${ddd}) ${firstPart}-${secondPart}` : `(${ddd}) ${firstPart}`;
  }

  private userId(): string | null {
    return this.authService.currentUser()?.userId ?? null;
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  private phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
    const digits = control.value.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11 ? null : { phone: true };
  }
}
