import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { catchError, forkJoin, map, of, finalize } from 'rxjs';
import { AppointmentResponse } from '../../core/models/appointment.model';
import { ClientResponse } from '../../core/models/client.model';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ClientApiService } from '../../core/services/client-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';
import { timeGridLabel } from '../../shared/time-grid-options';

@Component({
  selector: 'app-history-page',
  imports: [DatePipe],
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
})
export class HistoryPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly clientApi = inject(ClientApiService);
  private readonly appointmentApi = inject(AppointmentApiService);

  protected readonly clients = signal<ClientResponse[]>([]);
  protected readonly selectedClientId = signal('');
  protected readonly clientQuery = signal('');
  protected readonly clientSuggestionsOpen = signal(false);
  protected readonly appointments = signal<AppointmentResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly daysBack = signal(30);
  protected readonly daysForward = signal(30);

  protected readonly selectedClient = computed(
    () => this.clients().find((client) => client.id === this.selectedClientId()) ?? null,
  );
  protected readonly filteredClients = computed(() => {
    const query = this.clientQuery().trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.clients()
      .filter((client) => client.name.toLowerCase().includes(query))
      .slice(0, 8);
  });

  protected readonly labelForTime = timeGridLabel;

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
        next: (clients) => {
          this.clients.set(clients);
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar clientes.'));
        },
      });
  }

  protected changeClient(clientId: string): void {
    this.selectedClientId.set(clientId);
    this.loadHistory();
  }

  protected updateClientQuery(value: string): void {
    this.clientQuery.set(value);
    this.clientSuggestionsOpen.set(value.trim().length > 0);
    this.selectedClientId.set('');
    this.appointments.set([]);
  }

  protected selectClient(client: ClientResponse): void {
    this.selectedClientId.set(client.id);
    this.clientQuery.set(client.name);
    this.clientSuggestionsOpen.set(false);
  }

  protected openClientSuggestions(): void {
    this.clientSuggestionsOpen.set(this.clientQuery().trim().length > 0);
  }

  protected selectClientAndLoad(client: ClientResponse): void {
    this.selectClient(client);
    this.loadHistory();
  }

  protected setWindow(daysBack: number, daysForward: number): void {
    this.daysBack.set(daysBack);
    this.daysForward.set(daysForward);

    if (this.selectedClientId()) {
      this.loadHistory();
    }
  }

  protected loadHistory(): void {
    const userId = this.userId();
    const clientId = this.selectedClientId();

    if (!userId || !clientId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const requests = this.dateWindow().map((date) =>
      this.appointmentApi.listByDate(userId, date).pipe(catchError(() => of([]))),
    );

    forkJoin(requests)
      .pipe(
        map((results) =>
          results
            .flat()
            .filter((appointment) => appointment.clientId === clientId)
            .sort((a, b) =>
              `${b.appointmentDate}${b.startTime}`.localeCompare(`${a.appointmentDate}${a.startTime}`),
            ),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (appointments) => this.appointments.set(appointments),
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar histórico.'));
        },
      });
  }

  private dateWindow(): string[] {
    const dates: string[] = [];
    const start = new Date();
    start.setDate(start.getDate() - this.daysBack());

    const totalDays = this.daysBack() + this.daysForward();

    for (let index = 0; index <= totalDays; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      dates.push(date.toISOString().slice(0, 10));
    }

    return dates;
  }

  private userId(): string | null {
    return this.authService.currentUser()?.userId ?? null;
  }
}
