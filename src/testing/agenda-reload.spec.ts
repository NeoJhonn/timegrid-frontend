import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AgendaPage } from '../app/features/agenda/agenda.page';
import { AuthService } from '../app/core/services/auth.service';
import { AppointmentApiService } from '../app/core/services/appointment-api.service';
import { ClientApiService } from '../app/core/services/client-api.service';
import { claims } from './test-data';

describe('Agenda URL restoration', () => {
  let list: jasmine.Spy;
  beforeEach(() => {
    list = jasmine.createSpy('listByDate').and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(),
      provideRouter([{ path: 'app/agenda', component: AgendaPage }]),
      { provide: AuthService, useValue: { currentUser: () => claims } },
      { provide: AppointmentApiService, useValue: { listByDate: list } },
      { provide: ClientApiService, useValue: { list: () => of([]) } },
    ] });
  });
  it('loads the selected day directly from a refreshed deep link', async () => {
    await RouterTestingHarness.create('/app/agenda?date=2099-10-25');
    expect(TestBed.inject(Router).url).toBe('/app/agenda?date=2099-10-25');
    expect(list).toHaveBeenCalledOnceWith(claims.userId, '2099-10-25');
  });
  it('updates the URL when selecting a date and restores it on a fresh component', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/app/agenda?other=kept', AgendaPage);
    page['changeDate']('2099-11-02');
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toContain('date=2099-11-02');
    expect(TestBed.inject(Router).url).toContain('other=kept');
    await harness.navigateByUrl('/app/agenda?date=2099-11-03');
    expect(page['selectedDate']()).toBe('2099-11-03');
    expect(list).toHaveBeenCalledWith(claims.userId, '2099-11-03');
  });
  for (const date of ['invalid', '2099-02-31']) {
    it('falls back to today for invalid date ' + date, async () => {
      const harness = await RouterTestingHarness.create();
      const page = await harness.navigateByUrl('/app/agenda?date=' + date, AgendaPage);
      expect(list).toHaveBeenCalledOnceWith(claims.userId, page['today']());
    });
  }
});
