import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClientsPage } from '../app/features/clients/clients.page';
import { UserCreatePage } from '../app/features/users/user-create.page';
import { AuthService } from '../app/core/services/auth.service';
import { ClientApiService } from '../app/core/services/client-api.service';
import { UserApiService } from '../app/core/services/user-api.service';
import { claims, client, user } from './test-data';

describe('Record action styles', () => {
  let previous: string | null;
  beforeEach(() => {
    previous = document.documentElement.getAttribute('data-theme');
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(),
      { provide: AuthService, useValue: { currentUser: () => claims } },
      { provide: ClientApiService, useValue: { list: () => of([client]) } },
      { provide: UserApiService, useValue: { list: () => of([user]) } },
    ] });
  });
  afterEach(() => {
    if (previous === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', previous);
  });
  for (const page of [ClientsPage, UserCreatePage]) {
    for (const theme of ['light', 'dark', 'violet']) {
      it(`styles ${page.name} actions only in light theme (${theme})`, () => {
        document.documentElement.setAttribute('data-theme', theme);
        const fixture = page === ClientsPage ? TestBed.createComponent(ClientsPage) : TestBed.createComponent(UserCreatePage);
        fixture.detectChanges();
        const root = fixture.nativeElement as HTMLElement;
        const edit = getComputedStyle(root.querySelector('.record-edit-action')!);
        const remove = getComputedStyle(root.querySelector('.record-delete-action')!);
        if (theme === 'light') {
          expect(edit.backgroundColor).toBe('rgba(37, 99, 235, 0.12)');
          expect(edit.color).toBe('rgb(30, 64, 175)');
          expect(edit.borderTopColor).toBe('rgba(37, 99, 235, 0.4)');
          expect(edit.boxShadow).toContain('rgba(37, 99, 235, 0.12)');
          expect(remove.backgroundColor).toBe('rgba(220, 38, 38, 0.12)');
          expect(remove.color).toBe('rgb(153, 27, 27)');
          expect(remove.borderTopColor).toBe('rgba(220, 38, 38, 0.4)');
          expect(remove.boxShadow).toContain('rgba(220, 38, 38, 0.12)');
        } else {
          expect(edit.backgroundColor).toBe('rgba(0, 0, 0, 0)');
          expect(remove.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        }
      });
    }
  }
});
