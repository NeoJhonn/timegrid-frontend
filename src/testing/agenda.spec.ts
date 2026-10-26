import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AgendaPage } from '../app/features/agenda/agenda.page';
import { AuthService } from '../app/core/services/auth.service';
import { AppointmentApiService } from '../app/core/services/appointment-api.service';
import { ClientApiService } from '../app/core/services/client-api.service';
import { AgendaDatePickerComponent } from '../app/shared/agenda-date-picker.component';
import { AppointmentResponse } from '../app/core/models/appointment.model';
import { appointment, claims, client } from './test-data';

describe('Agenda regressions', () => {
  let fixture: ComponentFixture<AgendaPage>;
  let page: AgendaPage;
  let api: jasmine.SpyObj<AppointmentApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('appointments', ['listByDate', 'create', 'update', 'delete']);
    api.listByDate.and.returnValue(of([])); api.create.and.returnValue(of(appointment));
    api.update.and.returnValue(of(appointment)); api.delete.and.returnValue(of(void 0));
    TestBed.configureTestingModule({ imports: [AgendaPage], providers: [provideZonelessChangeDetection(), provideRouter([]),
      { provide: AuthService, useValue: { currentUser: () => claims } },
      { provide: AppointmentApiService, useValue: api },
      { provide: ClientApiService, useValue: { list: () => of([client]) } },
    ] });
    fixture = TestBed.createComponent(AgendaPage); page = fixture.componentInstance;
    fixture.detectChanges(); page['changeDate']('2099-10-18');
  });
  function fill() {
    page['openScheduleModal']('T0800'); page['selectClient'](client);
    page['appointmentForm'].controls.service.setValue('  Consulta  ');
  }
  it('shows a readable missing-client notice and registration link in light theme', () => {
    const previous = document.documentElement.getAttribute('data-theme');
    try {
      document.documentElement.setAttribute('data-theme', 'light');
      page['openScheduleModal']('T0800');
      page['updateClientQuery']('Cliente inexistente');
      fixture.detectChanges();
      const notice = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.agenda-client-not-found')!;
      expect(notice.textContent).toContain('Cliente não cadastrado');
      expect(getComputedStyle(notice).color).toBe('rgb(120, 53, 15)');
      expect(getComputedStyle(notice).backgroundColor).toBe('rgb(255, 251, 235)');
      const link = notice.querySelector('a')!;
      expect(getComputedStyle(link).color).toBe('rgb(146, 64, 14)');
      expect(link.getAttribute('href')).toBe('/app/clients');
    } finally {
      if (previous === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', previous);
    }
  });
  it('loads the date from the calendar output immediately', () => {
    fixture.debugElement.query(By.directive(AgendaDatePickerComponent)).componentInstance.dateSelected.emit('2099-10-19');
    expect(api.listByDate).toHaveBeenCalledWith(claims.userId, '2099-10-19');
    expect(page['selectedDate']()).toBe('2099-10-19');
  });
  it('blocks past dates and hides scheduling actions', () => {
    page['changeDate']('2000-01-01'); page['openScheduleModal']('T0800'); fixture.detectChanges();
    expect(page['selectedStartTime']()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Data passada');
    expect(api.create).not.toHaveBeenCalled();
  });
  it('shows missing-field feedback and does not submit', () => {
    page['openScheduleModal']('T0800'); page['submitAppointment'](); fixture.detectChanges();
    expect(api.create).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Preencha todos os campos obrigatórios');
    expect(page['appointmentForm'].controls.clientId.touched).toBeTrue();
  });
  it('creates with enum times, closes and reloads without a success banner', () => {
    fill(); api.listByDate.calls.reset(); page['submitAppointment']();
    expect(api.create).toHaveBeenCalledOnceWith(claims.userId, { clientId: client.id, service: 'Consulta', appointmentDate: '2099-10-18', startTime: 'T0800', endTime: 'T0830' });
    expect(page['selectedStartTime']()).toBeNull(); expect(page['message']()).toBe('');
    expect(api.listByDate).toHaveBeenCalledOnceWith(claims.userId, '2099-10-18');
  });
  it('prevents duplicate submissions while pending', () => {
    const pending = new Subject<AppointmentResponse>(); api.create.and.returnValue(pending);
    fill(); page['submitAppointment'](); page['submitAppointment']();
    expect(api.create).toHaveBeenCalledTimes(1); pending.next(appointment); pending.complete();
    expect(page['saving']()).toBeFalse();
  });
  it('retains failed creation and allows retry', () => {
    api.create.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Horário ocupado.' } })));
    fill(); page['submitAppointment']();
    expect(page['selectedStartTime']()).toBe('T0800'); expect(page['saving']()).toBeFalse();
    expect(page['errorMessage']()).toBe('Horário ocupado.');
  });
  it('keeps ending boundaries occupied and stops before another appointment', () => {
    page['appointments'].set([appointment]);
    expect(page['canScheduleAt']('T0900')).toBeFalse(); expect(page['canScheduleAt']('T1000')).toBeFalse();
    expect(page['canScheduleAt']('T1030')).toBeTrue(); page['openScheduleModal']('T0800');
    expect(page['availableEndOptions']().map(t => t.value)).toEqual(['T0800', 'T0830']);
  });
  it('updates only service and ending time', () => {
    page['openEditModal'](appointment); page['updateForm'].setValue({ service: ' Revisão ', endTime: 'T1030' });
    page['saveEdit']();
    expect(api.update).toHaveBeenCalledOnceWith(claims.userId, appointment.id, { service: 'Revisão', endTime: 'T1030' });
    expect(page['editingAppointment']()).toBeNull();
  });
  it('requires deletion confirmation and supports cancellation', () => {
    page['openDeleteModal'](appointment); expect(api.delete).not.toHaveBeenCalled();
    page['closeDeleteModal'](); page['confirmDelete'](); expect(api.delete).not.toHaveBeenCalled();
    page['openDeleteModal'](appointment); page['confirmDelete']();
    expect(api.delete).toHaveBeenCalledOnceWith(claims.userId, appointment.id);
    expect(page['deletingAppointment']()).toBeNull();
  });
  it('invalidates the selected client when autocomplete text changes', () => {
    fill(); page['updateClientQuery']('Outro');
    expect(page['appointmentForm'].controls.clientId.value).toBe(''); expect(page['selectedClient']()).toBeNull();
  });
});
