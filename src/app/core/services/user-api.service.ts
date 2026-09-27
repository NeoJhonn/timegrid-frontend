import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { UserResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${API_BASE_URL}/users`);
  }
}

