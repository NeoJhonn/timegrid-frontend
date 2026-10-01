import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  protected readonly search = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
  });

  protected readonly filteredClients = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.clients();
    }

    return this.clients().filter((client) =>
      `${client.name} ${client.phone}`.toLowerCase().includes(term),
    );
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

    if (!userId || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    const request = this.form.getRawValue();
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
    this.form.setValue({
      name: client.name,
      phone: client.phone,
    });
  }

  protected cancelEdit(): void {
    this.editingClient.set(null);
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

  private userId(): string | null {
    return this.authService.currentUser()?.userId ?? null;
  }
}
