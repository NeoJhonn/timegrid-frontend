import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ClientRequest, ClientResponse } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly http = inject(HttpClient);
  private readonly clientsByUserId = new Map<string, ClientResponse[]>();

  list(userId: string): Observable<ClientResponse[]> {
    const cachedClients = this.clientsByUserId.get(userId);

    if (cachedClients) {
      return of([...cachedClients]);
    }

    return this.http.get<ClientResponse[]>(`${API_BASE_URL}/users/${userId}/clients`).pipe(
      tap((clients) => {
        this.clientsByUserId.set(userId, clients);
      }),
    );
  }

  create(userId: string, request: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${API_BASE_URL}/users/${userId}/clients`, request).pipe(
      tap((client) => {
        const cachedClients = this.clientsByUserId.get(userId);

        if (cachedClients) {
          this.clientsByUserId.set(userId, [...cachedClients, client]);
        }
      }),
    );
  }

  update(userId: string, clientId: string, request: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(
      `${API_BASE_URL}/users/${userId}/clients/${clientId}`,
      request,
    ).pipe(
      tap((updatedClient) => {
        const cachedClients = this.clientsByUserId.get(userId);

        if (cachedClients) {
          this.clientsByUserId.set(
            userId,
            cachedClients.map((client) => (client.id === clientId ? updatedClient : client)),
          );
        }
      }),
    );
  }

  delete(userId: string, clientId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${userId}/clients/${clientId}`).pipe(
      tap(() => {
        const cachedClients = this.clientsByUserId.get(userId);

        if (cachedClients) {
          this.clientsByUserId.set(
            userId,
            cachedClients.filter((client) => client.id !== clientId),
          );
        }
      }),
    );
  }
}
