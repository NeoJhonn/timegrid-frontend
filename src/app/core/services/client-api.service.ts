import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ClientRequest, ClientResponse } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly http = inject(HttpClient);

  list(userId: string): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(`${API_BASE_URL}/users/${userId}/clients`);
  }

  create(userId: string, request: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${API_BASE_URL}/users/${userId}/clients`, request);
  }

  update(userId: string, clientId: string, request: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(
      `${API_BASE_URL}/users/${userId}/clients/${clientId}`,
      request,
    );
  }

  delete(userId: string, clientId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${userId}/clients/${clientId}`);
  }
}

