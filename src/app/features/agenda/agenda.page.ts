import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { AppointmentResponse, TimeGrid } from '../../core/models/appointment.model';
import { ClientResponse } from '../../core/models/client.model';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ClientApiService } from '../../core/services/client-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';
import { TIME_GRID_OPTIONS, timeGridLabel } from '../../shared/time-grid-options';

@Component({
  selector: 'app-agenda-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './agenda.page.html',
  styleUrl: './agenda.page.scss',
})
export class AgendaPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly clientApi = inject(ClientApiService);

  protected readonly selectedDate = signal(this.today());
  protected readonly clientQuery = signal('');
  protected readonly selectedClientId = signal('');
  protected readonly clients = signal<ClientResponse[]>([]);
  protected readonly appointments = signal<AppointmentResponse[]>([]);
  protected readonly editingAppointment = signal<AppointmentResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly timeOptions = TIME_GRID_OPTIONS;

  protected readonly appointmentForm = this.formBuilder.nonNullable.group({
    clientId: ['', Validators.required],
    service: ['', Validators.required],
    appointmentDate: [this.today(), Validators.required],
    startTime: ['T0900' as TimeGrid, Validators.required],
    endTime: ['T0930' as TimeGrid, Validators.required],
  });

  protected readonly updateForm = this.formBuilder.nonNullable.group({
    service: ['', Validators.required],
    endTime: ['T0930' as TimeGrid, Validators.required],
  });

  protected readonly filteredClients = computed(() => {
    const query = this.clientQuery().trim().toLowerCase();

    if (!query) {
      return this.clients().slice(0, 5);
    }

    return this.clients()
      .filter((client) => client.name.toLowerCase().includes(query))
      .slice(0, 6);
  });

  protected readonly selectedClient = computed(() => {
    const clientId = this.selectedClientId();
    return this.clients().find((client) => client.id === clientId) ?? null;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  protected loadInitialData(): void {
    const userId = this.userId();

    if (!userId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      clients: this.clientApi.list(userId),
      appointments: this.appointmentApi.listByDate(userId, this.selectedDate()),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ clients, appointments }) => {
          this.clients.set(clients);
          this.appointments.set(this.sortAppointments(appointments));
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel carregar a agenda.'));
        },
      });
  }

  protected changeDate(date: string): void {
    this.selectedDate.set(date);
    this.appointmentForm.controls.appointmentDate.setValue(date);
    this.loadAppointments();
  }

  protected loadAppointments(): void {
    const userId = this.userId();

    if (!userId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentApi
      .listByDate(userId, this.selectedDate())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (appointments) => this.appointments.set(this.sortAppointments(appointments)),
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel carregar agendamentos.'));
        },
      });
  }

  protected submitAppointment(): void {
    const userId = this.userId();

    if (!userId || this.appointmentForm.invalid || this.saving()) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.appointmentApi
      .create(userId, this.appointmentForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Agendamento criado com sucesso.');
          this.appointmentForm.patchValue({ service: '', clientId: '' });
          this.clientQuery.set('');
          this.selectedClientId.set('');
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel criar o agendamento.'));
        },
      });
  }

  protected selectClient(client: ClientResponse): void {
    this.appointmentForm.controls.clientId.setValue(client.id);
    this.selectedClientId.set(client.id);
    this.clientQuery.set(client.name);
  }

  protected updateClientQuery(value: string): void {
    this.clientQuery.set(value);
    this.appointmentForm.controls.clientId.setValue('');
    this.selectedClientId.set('');
  }

  protected startEdit(appointment: AppointmentResponse): void {
    this.editingAppointment.set(appointment);
    this.updateForm.setValue({
      service: appointment.service,
      endTime: appointment.endTime,
    });
  }

  protected cancelEdit(): void {
    this.editingAppointment.set(null);
    this.updateForm.reset({ service: '', endTime: 'T0930' });
  }

  protected saveEdit(): void {
    const userId = this.userId();
    const appointment = this.editingAppointment();

    if (!userId || !appointment || this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.message.set('');

    this.appointmentApi
      .update(userId, appointment.id, this.updateForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Agendamento atualizado.');
          this.cancelEdit();
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel atualizar o agendamento.'));
        },
      });
  }

  protected deleteAppointment(appointment: AppointmentResponse): void {
    const userId = this.userId();

    if (!userId) {
      return;
    }

    this.errorMessage.set('');
    this.message.set('');

    this.appointmentApi.delete(userId, appointment.id).subscribe({
      next: () => {
        this.message.set('Agendamento removido.');
        this.loadAppointments();
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Nao foi possivel remover o agendamento.'));
      },
    });
  }

  protected labelForTime = timeGridLabel;

  private sortAppointments(appointments: AppointmentResponse[]): AppointmentResponse[] {
    return [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  private userId(): string | null {
    return this.authService.currentUser()?.userId ?? null;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
