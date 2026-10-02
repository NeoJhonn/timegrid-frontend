import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { AppointmentResponse, TimeGrid } from '../../core/models/appointment.model';
import { ClientResponse } from '../../core/models/client.model';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ClientApiService } from '../../core/services/client-api.service';
import { apiErrorMessage } from '../../shared/api-error-message';
import { TIME_GRID_OPTIONS, TimeGridOption, timeGridLabel } from '../../shared/time-grid-options';

@Component({
  selector: 'app-agenda-page',
  imports: [ReactiveFormsModule, RouterLink],
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
  protected readonly selectedStartTime = signal<TimeGrid | null>(null);
  protected readonly editingAppointment = signal<AppointmentResponse | null>(null);
  protected readonly deletingAppointment = signal<AppointmentResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly errorMessage = signal('');
  protected readonly scheduleValidationMessage = signal('');
  protected readonly timeOptions = TIME_GRID_OPTIONS;

  protected readonly appointmentForm = this.formBuilder.nonNullable.group({
    clientId: ['', Validators.required],
    service: ['', Validators.required],
    appointmentDate: [this.today(), Validators.required],
    startTime: ['T0800' as TimeGrid, Validators.required],
    endTime: ['T0830' as TimeGrid, Validators.required],
  });

  protected readonly updateForm = this.formBuilder.nonNullable.group({
    service: ['', Validators.required],
    endTime: ['T0830' as TimeGrid, Validators.required],
  });

  protected readonly selectedDateInfo = computed(() => {
    const date = this.dateFromIso(this.selectedDate());
    return {
      weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date),
      date: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date),
    };
  });

  protected readonly canCreateAppointment = computed(() => this.selectedDate() >= this.today());

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

  protected readonly availableEndOptions = computed(() => {
    const startTime = this.selectedStartTime() ?? this.editingAppointment()?.startTime;

    if (!startTime) {
      return this.timeOptions;
    }

    const startIndex = this.indexOfTime(startTime);
    const editingId = this.editingAppointment()?.id;
    const nextAppointmentIndex = this.appointments()
      .filter((appointment) => appointment.id !== editingId)
      .map((appointment) => this.indexOfTime(appointment.startTime))
      .filter((index) => index > startIndex)
      .sort((a, b) => a - b)[0];

    const maxIndex = nextAppointmentIndex === undefined ? this.timeOptions.length - 1 : nextAppointmentIndex - 1;

    return this.timeOptions
      .slice(startIndex, maxIndex + 1)
      .filter((option) => option.value === startTime || this.canUseAsEndTime(option, editingId));
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
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar a agenda.'));
        },
      });
  }

  protected changeDate(date: string): void {
    this.selectedDate.set(date);
    this.appointmentForm.controls.appointmentDate.setValue(date);
    this.closeScheduleModal();
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
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar agendamentos.'));
        },
      });
  }

  protected openScheduleModal(startTime: TimeGrid): void {
    if (!this.canCreateAppointment()) {
      return;
    }

    const endTime = this.nextAvailableEndTime(startTime);
    this.selectedStartTime.set(startTime);
    this.clientQuery.set('');
    this.selectedClientId.set('');
    this.scheduleValidationMessage.set('');
    this.appointmentForm.reset({
      clientId: '',
      service: '',
      appointmentDate: this.selectedDate(),
      startTime,
      endTime,
    });
  }

  protected closeScheduleModal(): void {
    this.selectedStartTime.set(null);
    this.clientQuery.set('');
    this.selectedClientId.set('');
    this.scheduleValidationMessage.set('');
    this.appointmentForm.reset({
      clientId: '',
      service: '',
      appointmentDate: this.selectedDate(),
      startTime: 'T0800',
      endTime: 'T0830',
    });
  }

  protected submitAppointment(): void {
    const userId = this.userId();

    if (!this.canCreateAppointment()) {
      this.scheduleValidationMessage.set('Não é possível criar agendamento em uma data passada.');
      return;
    }

    if (!userId || this.appointmentForm.invalid || this.saving()) {
      this.appointmentForm.markAllAsTouched();
      this.scheduleValidationMessage.set('Preencha todos os campos obrigatórios para confirmar o agendamento.');
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');
    this.scheduleValidationMessage.set('');

    this.appointmentApi
      .create(userId, this.appointmentForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Agendamento criado com sucesso.');
          this.closeScheduleModal();
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível criar o agendamento.'));
        },
      });
  }

  protected selectClient(client: ClientResponse): void {
    this.appointmentForm.controls.clientId.setValue(client.id);
    this.selectedClientId.set(client.id);
    this.clientQuery.set(client.name);
    this.scheduleValidationMessage.set('');
  }

  protected updateClientQuery(value: string): void {
    this.clientQuery.set(value);
    this.appointmentForm.controls.clientId.setValue('');
    this.selectedClientId.set('');
  }

  protected setAppointmentEndTime(endTime: TimeGrid): void {
    this.appointmentForm.controls.endTime.setValue(endTime);
    this.appointmentForm.controls.endTime.markAsTouched();
  }

  protected openEditModal(appointment: AppointmentResponse): void {
    this.editingAppointment.set(appointment);
    this.updateForm.setValue({
      service: appointment.service,
      endTime: appointment.endTime,
    });
  }

  protected closeEditModal(): void {
    this.editingAppointment.set(null);
    this.updateForm.reset({ service: '', endTime: 'T0830' });
  }

  protected setUpdateEndTime(endTime: TimeGrid): void {
    this.updateForm.controls.endTime.setValue(endTime);
    this.updateForm.controls.endTime.markAsTouched();
  }

  protected saveEdit(): void {
    const userId = this.userId();
    const appointment = this.editingAppointment();

    if (!userId || !appointment || this.updateForm.invalid || this.saving()) {
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
          this.closeEditModal();
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível atualizar o agendamento.'));
        },
      });
  }

  protected openDeleteModal(appointment: AppointmentResponse): void {
    this.deletingAppointment.set(appointment);
  }

  protected closeDeleteModal(): void {
    this.deletingAppointment.set(null);
  }

  protected confirmDelete(): void {
    const userId = this.userId();
    const appointment = this.deletingAppointment();

    if (!userId || !appointment || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.message.set('');

    this.appointmentApi
      .delete(userId, appointment.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Agendamento removido.');
          this.closeDeleteModal();
          this.loadAppointments();
        },
        error: (error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error, 'Não foi possível remover o agendamento.'));
        },
      });
  }

  protected appointmentStartingAt(time: TimeGrid): AppointmentResponse | null {
    return this.appointments().find((appointment) => appointment.startTime === time) ?? null;
  }

  protected isCoveredByPreviousAppointment(time: TimeGrid): boolean {
    const index = this.indexOfTime(time);

    return this.appointments().some((appointment) => {
      const startIndex = this.indexOfTime(appointment.startTime);
      const endIndex = this.indexOfTime(appointment.endTime);
      return startIndex < index && endIndex >= index;
    });
  }

  protected appointmentSpan(appointment: AppointmentResponse): number {
    return this.indexOfTime(appointment.endTime) - this.indexOfTime(appointment.startTime) + 1;
  }

  protected canScheduleAt(time: TimeGrid): boolean {
    return !this.appointmentStartingAt(time) && !this.isCoveredByPreviousAppointment(time);
  }

  protected labelForTime = timeGridLabel;

  private nextAvailableEndTime(startTime: TimeGrid): TimeGrid {
    const startIndex = this.indexOfTime(startTime);
    const nextAppointmentIndex = this.appointments()
      .map((appointment) => this.indexOfTime(appointment.startTime))
      .filter((index) => index > startIndex)
      .sort((a, b) => a - b)[0];
    const nextIndex = Math.min(
      nextAppointmentIndex === undefined ? startIndex + 1 : nextAppointmentIndex - 1,
      this.timeOptions.length - 1,
    );

    return this.timeOptions[Math.max(startIndex, nextIndex)].value;
  }

  private canUseAsEndTime(option: TimeGridOption, editingId?: string): boolean {
    return !this.appointments()
      .filter((appointment) => appointment.id !== editingId)
      .some((appointment) => {
        const optionIndex = this.indexOfTime(option.value);
        const startIndex = this.indexOfTime(appointment.startTime);
        const endIndex = this.indexOfTime(appointment.endTime);
        return startIndex <= optionIndex && endIndex >= optionIndex;
      });
  }

  private indexOfTime(time: TimeGrid): number {
    return this.timeOptions.findIndex((option) => option.value === time);
  }

  private sortAppointments(appointments: AppointmentResponse[]): AppointmentResponse[] {
    return [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  private userId(): string | null {
    return this.authService.currentUser()?.userId ?? null;
  }

  private today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private dateFromIso(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }
}
