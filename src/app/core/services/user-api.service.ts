import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  ChangePasswordRequest,
  ResetPasswordRequest,
  UserRequest,
  UserResponse,
  UserUpdateRequest,
} from '../models/user.model';

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

  update(userId: string, request: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${API_BASE_URL}/users/${userId}`, request);
  }

  changeOwnPassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${API_BASE_URL}/users/me/password`, request);
  }

  resetPassword(userId: string, request: ResetPasswordRequest): Observable<void> {
    return this.http.patch<void>(`${API_BASE_URL}/users/${userId}/password`, request);
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${userId}`);
  }
}
