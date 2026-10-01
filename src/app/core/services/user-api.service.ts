import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { UserRequest, UserResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${API_BASE_URL}/users`);
  }

  create(request: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${API_BASE_URL}/users`, request);
  }

  findById(userId: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API_BASE_URL}/users/${userId}`);
  }

  update(userId: string, request: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${API_BASE_URL}/users/${userId}`, request);
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${userId}`);
  }
}
