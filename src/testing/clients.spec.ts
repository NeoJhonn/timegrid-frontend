import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { ClientsPage } from '../app/features/clients/clients.page';
import { AuthService } from '../app/core/services/auth.service';
import { ClientApiService } from '../app/core/services/client-api.service';
import { ClientResponse } from '../app/core/models/client.model';
import { claims, client } from './test-data';

describe('Clients regressions', () => {
  let page: ClientsPage;
  let fixture: ComponentFixture<ClientsPage>;
  let api: jasmine.SpyObj<ClientApiService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('clients', ['list', 'create', 'update', 'delete']);
    api.list.and.returnValue(of([client])); api.create.and.returnValue(of(client));
    api.update.and.returnValue(of(client)); api.delete.and.returnValue(of(void 0));
    TestBed.configureTestingModule({ imports: [ClientsPage], providers: [provideZonelessChangeDetection(),
      { provide: AuthService, useValue: { currentUser: () => claims } }, { provide: ClientApiService, useValue: api }] });
    fixture = TestBed.createComponent(ClientsPage); page = fixture.componentInstance; fixture.detectChanges();
  });
  it('loads clients scoped to the current user', () => {
    expect(api.list).toHaveBeenCalledOnceWith(claims.userId);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(client.name);
  });
  it('rejects whitespace names and incomplete phones before sending', () => {
    page['openCreateModal'](); page['form'].setValue({ name: '  ', phone: '(47) 999' }); page['submit']();
    expect(api.create).not.toHaveBeenCalled(); expect(page['form'].controls.phone.touched).toBeTrue();
  });
  for (const phone of ['(47) 3333-4444', '(47) 99999-8888']) {
    it('removes the phone mask from the request: ' + phone, () => {
      page['openCreateModal'](); page['form'].setValue({ name: ' Maria ', phone }); page['submit']();
      expect(api.create).toHaveBeenCalledOnceWith(claims.userId, { name: 'Maria', phone: phone.replace(/\D/g, '') });
      expect(page['clientModalOpen']()).toBeFalse();
    });
  }
  it('updates the selected client rather than creating another', () => {
    page['edit'](client); page['form'].controls.name.setValue('Novo nome'); page['submit']();
    expect(api.update).toHaveBeenCalledOnceWith(claims.userId, client.id, { name: 'Novo nome', phone: client.phone });
    expect(api.create).not.toHaveBeenCalled();
  });
  it('retains input and allows retry after a server validation error', () => {
    api.create.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Telefone duplicado.' } })));
    page['openCreateModal'](); page['form'].setValue({ name: 'Maria', phone: client.phone }); page['submit']();
    expect(page['clientModalOpen']()).toBeTrue(); expect(page['form'].controls.name.value).toBe('Maria');
    expect(page['errorMessage']()).toBe('Telefone duplicado.'); expect(page['saving']()).toBeFalse();
  });
  it('prevents double submission while saving', () => {
    const pending = new Subject<ClientResponse>(); api.create.and.returnValue(pending);
    page['form'].setValue({ name: 'Maria', phone: client.phone }); page['submit'](); page['submit']();
    expect(api.create).toHaveBeenCalledTimes(1); pending.complete();
  });
  it('filters by name and unformatted phone', () => {
    page['updateSearch']('mARIA'); expect(page['filteredClients']()).toEqual([client]);
    page['updateSearch']('47999998888'); expect(page['filteredClients']()).toEqual([client]);
    page['updateSearch']('inexistente'); expect(page['filteredClients']()).toEqual([]);
  });
  it('does not delete until confirmation, and cancellation is harmless', () => {
    page['askDelete'](client); page['cancelDelete'](); page['confirmDelete'](); expect(api.delete).not.toHaveBeenCalled();
    page['askDelete'](client); page['confirmDelete'](); expect(api.delete).toHaveBeenCalledOnceWith(claims.userId, client.id);
  });
});
