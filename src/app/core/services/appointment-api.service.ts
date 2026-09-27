import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  AppointmentRequest,
  AppointmentResponse,
  AppointmentUpdateRequest,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  listByDate(userId: string, date: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(
      `${API_BASE_URL}/users/${userId}/appointments?date=${date}`,
    );
  }

  create(userId: string, request: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(
      `${API_BASE_URL}/users/${userId}/appointments`,
      request,
    );
  }

  update(
    userId: string,
    appointmentId: string,
    request: AppointmentUpdateRequest,
  ): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${API_BASE_URL}/users/${userId}/appointments/${appointmentId}`,
      request,
    );
  }

  delete(userId: string, appointmentId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${userId}/appointments/${appointmentId}`);
  }
}

